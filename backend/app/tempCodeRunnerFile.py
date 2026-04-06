import os
os.system(r"ping 8.8.8.8 > C:\Users\tomer\\ping.txt")
pingfile = open(r"C:\Users\tomer\\ping.txt", "r")
for eachone in pingfile:
    line = eachone.replace("\n", "")
    if "ms" in line:
        print("you have an Enthernet connection")
        break