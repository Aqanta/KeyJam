import time
import fluidsynth
import subprocess

fs = fluidsynth.Synth()
fs.start()

sfid = fs.sfload("/usr/share/sounds/sf3/default-GM.sf3")
fs.program_select(0, sfid, 128, 25)

while True:
    key = subprocess.run("read -n1 val && echo $val", check=True, text=True, capture_output=True, shell=True, executable="/bin/bash").stdout.strip()
    if str.isalnum(key):
        fs.noteon(0, ord(key) - 60, 100)

time.sleep(1.0)

fs.delete()