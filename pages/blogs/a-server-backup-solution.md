---
title: Rclone+Restic实现服务器数据定期增量备份
date: 2024-04-08
tags:
  - 服务器运维
---

[[toc]]


## 为什么Rclone+Restic

### 首先介绍一下这两个工具与它们之间的区别

Rclone

- Rclone是一款的命令行工具，支持在不同对象存储、网盘间同步、上传、下载数据。
- Rclone 面向的是**文件同步**，即保证两端文件的一致，也可以增量备份。
- Rclone **不记录文件版本**，无法根据某一次备份找回特定时间点上的文件。
- Rclone 可以在配置的多个存储端之间传输文件。
- 备份分散文件需要多次命令



Restic

- Restic 是一款 GO 语言开发的开源免费且快速、高效和安全的跨平台备份工具，使用加密技术来保证你的数据安全性和完整性，可以将本地数据加密后传输到指定的存储。
- Restic 面向的是**文件备份和加密**，文件先加密再传输备份，而且是增量备份，即每次只备份变化的部分。
- Restic 每次备份都会生成一个**快照**，记录当前时间点的文件结构，可以找回特定时间点的文件。
- 能从文件中读取所有需要备份的文件地址



而[Restic支持将Rclone作为输入源](https://restic.readthedocs.io/en/stable/030_preparing_a_new_repo.html#other-services-via-rclone)，这样就很好的结合两者的优点，实现增量备份到网盘的操作。



## 配置与使用

### Rclone

``` shell
# 安装
apt-get install rclone
# 配置
rclone config
```

这里我配置的是Google drive，可以参考这篇[文章](https://aduan.cc/index.php/archives/20/)，写的很清晰，其他网盘也可以参考。

### Restic

``` shell
# 安装
apt install restic

#使用 rclone 作为后端，初始化 Restic 仓库：
restic -r rclone:[remote_name]:[path_to_repository] init
```

此时，已经可以使用Restic进行备份等操作了

``` shell
# 备份
restic -r rclone:[remote_name]:[path_to_repository] backup [path_to_backup]

# 恢复备份
restic -r rclone:[remote_name]:[path_to_repository] restore [snapshot_id] --target [path_to_restore]

# 列出快照
restic -r rclone:[remote_name]:[path_to_repository] snapshots

# 清理
restic -r rclone:[remote_name]:[path_to_repository] forget --keep-last 3 --prune

```



## 自动备份脚本

为了实现自动备份，需要写一个脚本，然后设置定时任务执行。

我参考了这篇[博客](https://arc.net/l/quote/yifqyuza)写出了下面脚本

``` shell
#!/bin/bash

source /root/restic_backup/backup_config.conf

# Check for required commands
for cmd in restic curl hostname; do
    if ! command -v $cmd &> /dev/null; then
        echo "Error: Required command '$cmd' not found. Exiting."
        exit 1
    fi
done

export RCLONE_TRANSFERS=$RCLONE_TRANSFERS
export RCLONE_CHECKERS=$RCLONE_CHECKERS

backup_success=true
backup_status="successful"  # Default status

send_email() {
    local subject_date=$(date +%Y-%m-%d)  # 当天日期
    local email_subject="Backup $backup_status on $subject_date"  # 邮件主题，包含当天日期和是否成功

    local message="$1"  # 邮件内容
    local recipient="cheungkintong3000@gmail.com"  # 收件人邮箱地址

    if [[ -z "$message" ]]; then
        echo "邮件内容未设置。跳过发送。"
        return 1
    fi
    local email_content="To: $RECIPIENT\nSubject: $email_subject\n\n$message"
    # 发送邮件
    if ! echo -e "$email_content" | msmtp "$RECIPIENT" > /dev/null; then
        echo "警告：发送邮件失败。"
    fi
}

backup_and_cleanup() {
    local retries=2
    local delay=10  # Initial retry delay in seconds
    local attempt=0
    local start_time=$(date +%s)
    local end_time
    local stats_output
    local cleanup_output=""
    
    # Start backup process
    echo "Starting backup at $(date), attempt $((attempt+1))" >> "$LOG_FILE"

    while [ $attempt -le $retries ]; do
        if restic -r "$RESTIC_REPOSITORY" --password-file "$PASSWORD_FILE" backup --files-from "$FILES_FROM" --exclude-file="$EXCLUDE_FILE" --tag "$BACKUP_TAG" >> "$LOG_FILE" 2>&1; then
            end_time=$(date +%s)
            echo "Backup completed successfully at $(date). Duration: $((end_time - start_time)) seconds." >> "$LOG_FILE"
            stats_output=$(restic -r "$RESTIC_REPOSITORY" --password-file "$PASSWORD_FILE" stats | awk '/Stats in restore-size mode:/,0')
            break
        else
            attempt=$((attempt + 1))
            echo "Backup failed, attempt $((attempt+1)) at $(date). Check log $LOG_FILE for details." >> "$LOG_FILE"
            sleep $delay
            delay=$((delay * 2))  # Exponential backoff
            if [ $attempt -gt $retries ]; then
                backup_success=false
                backup_status="failed"
                echo "Backup failed after $retries retries at $(date +%Y-%m-%d\ %H:%M:%S)." >> "$LOG_FILE"
                break
            fi
        fi
    done
    
    # Start cleanup process
    if $backup_success; then
        echo "Starting cleanup process at $(date)" >> "$LOG_FILE"
        if restic -r "$RESTIC_REPOSITORY" --password-file "$PASSWORD_FILE" forget --keep-last "$KEEP_SNAPSHOTS" --prune >>"$LOG_FILE" 2>&1; then
            cleanup_output="Cleanup completed successfully at $(date). Kept the last $KEEP_SNAPSHOTS snapshots."
        else
            cleanup_output="Cleanup failed at $(date), see log for details."
            backup_status="failed"
        fi
    else
        cleanup_output="Cleanup skipped due to backup failure."
    fi
    
    # Send email summary
    send_email "?️ Date: $(date +%Y-%m-%d)
?️ Hostname: $HOSTNAME
? IP Address: $(curl -s ip.sb)
? Repository: $RESTIC_REPOSITORY

? Backup Summary:
$stats_output

? Cleanup Summary:
$cleanup_output

Check log $LOG_FILE for more details."
}

# Start the backup and cleanup process, then send a summary email
backup_and_cleanup

```



要使用这个脚本需要完成下面的配置



### SMTP发送邮件配置



``` shell
# 安装
apt install msmtprc

```



修改msmtprc配置（SMTP相关配置google一下很多教程，这里不赘述了（其实是我懒））

``` shell
# /etc/msmtprc


# Set default values for all following accounts.

defaults
tls on
#如果不是SSL/TLS加密方式改成off
tls_starttls off
#如果是STARTTLS加密改成on
tls_certcheck off
logfile /var/log/msmtp.log

# The SMTP server of your mail provider.
account name
host smtp.xx.com
#SMTP server port
port 465
#mail address
from xxxx@xx.com
user xxxx@xx.com
password 
auth login
# Set a default account
account default : name

```



完成配置后可以执行下面命令测试一下

```javascript
echo "来自msmtp发出的测试邮件" | msmtp 自己的邮箱
```



### Restic参数配置

去这个[仓库](https://github.com/kintong3000/linux-ultils-shells/tree/main)下载`restic_backup`文件夹即可得到所有配置文件



**修改backup_config.conf相关参数**

``` shell
# backup_config.conf

# The repository location for restic backups. This is specified using the rclone backend syntax.
# Format: "rclone:<rclone remote name>:<path within the remote>"
RESTIC_REPOSITORY="rclone:google_drive:backup"

# Path to the file containing the password for the restic repository. 
# This file should be secured with appropriate permissions to prevent unauthorized access.

PASSWORD_FILE="/root/restic_backup/restic_password_file"

# File containing a list of paths to include in the backup. Each path should be on a separate line.
FILES_FROM="/root/restic_backup/backup_rules"

# File containing patterns to exclude from the backup. Each pattern should be on a separate line.
EXCLUDE_FILE="/root/restic_backup/exclude_rules.txt"

# Path to the log file where backup operation details will be recorded.
LOG_FILE="/var/log/restic_backup.log"

# A tag to assign to all snapshots created by this backup for easy identification and management.
BACKUP_TAG="automated_backup"

# The number of most recent snapshots to keep. Older snapshots exceeding this count will be pruned.
KEEP_SNAPSHOTS=5  # Number of snapshots to retain

# Rclone performance optimization settings
# The number of file transfers to run in parallel. Increasing this can improve transfer speeds,
# especially for a large number of small files, assuming the bandwidth allows for it.
# The default in rclone is 4 parallel transfers.
RCLONE_TRANSFERS=10

# The number of checkers to use. Checkers are used by rclone to determine if a file needs to be transferred.
# Increasing this number can speed up this checking process, which can be beneficial when dealing with
# a large number of files. This setting helps in speeding up the comparison between source and destination.
RCLONE_CHECKERS=20

# Email to receive notifications
RECIPIENT=
```



**写入密码到restic_password_file**



**根据需要修改排除规则文件:** 

```txt
# exclude_rules.txt

/home/user/documents/temp
/home/user/photos/drafts
*.tmp
*.cache

# 排除所有以点开头的隐藏文件和文件夹
.*

# 但保留特定的文件，如 .zshrc
!.zshrc
```

**根据需要修改备份规则文件**

``` shell
# backup_rules

/root
```



所有文件放置位置根据脚本决定，默认为/root/restic_backup



脚本设置定时任务即可完成自动定时备份

## 最后

效果如下

![image-20240405012721727](https://cdn.jsdelivr.net/gh/kintong3000/Kintong-Image-Hosting@main/img/image-20240405012721727.png)
