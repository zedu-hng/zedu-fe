$lines = cmdkey /list
$targets = $lines | Where-Object { $_ -match 'Target:' } | ForEach-Object { ($_ -split ':',2)[1].Trim() } | Where-Object { $_ -match 'github' }
if ($targets) {
  foreach ($t in $targets) {
    Write-Output "Deleting: $t"
    cmdkey /delete:$t
  }
} else {
  Write-Output "No GitHub credentials found"
}
Write-Output "Remaining:"
(cmdkey /list) | Where-Object { $_ -match 'github' }
