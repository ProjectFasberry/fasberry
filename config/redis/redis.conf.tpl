dir /data
  
appendonly yes

user USERNAME_PLACEHOLDER on >PASSWORD_PLACEHOLDER ~* +@all

user default off

rename-command FLUSHALL ""
rename-command FLUSHDB ""