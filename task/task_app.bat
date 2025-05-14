@echo off
echo [INFO] Starting task_app.bat...
echo [INFO] Args count: %*

REM
set /a result=%RANDOM% %% 3
echo [INFO] Simulated outcome = %result%

REM
ping 127.0.0.1 -n 3 >nul

if %result%==0 (
    echo [INFO] Job succeeded.
    exit /b 0
) else if %result%==1 (
    echo [ERROR] Job failed due to logical error. 1>&2
    exit /b 1
) else (
    echo [CRASH] Simulating crash... 1>&2
    crash_command REM
)
