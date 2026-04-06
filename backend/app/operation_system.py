import os 
command = os.popen("ipconfig")
output = command.read()

with open ("output.txt" ,"w") as text:
    text.write(output)
with open ("output.txt" ,"r") as text:
   s= text.read()

print(s)
#Export to file
import os
os.system(r"ping 8.8.8.8 > C:\Users\tomer\\ping.txt")
pingfile = open(r"C:\Users\tomer\\ping.txt", "r")
for eachone in pingfile:
    line = eachone.replace("\n", "")
    if "ms" in line:
        print("you have an Enthernet connection")
        break
print(output)
print(os.system("ipconfig"))

