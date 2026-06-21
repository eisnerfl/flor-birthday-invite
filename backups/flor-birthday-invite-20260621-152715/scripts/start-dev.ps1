$Project = "C:\Users\nicow\Documents\FLOR'S BDAY\flor-birthday-invite"
Set-Location -LiteralPath $Project
& "C:\Program Files\nodejs\npm.cmd" run dev -- --hostname 0.0.0.0 --port 3000
