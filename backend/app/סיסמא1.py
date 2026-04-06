def passwords ():
    t = input("what is your password? ")
    return t

def cheak(t):
 while True:
    if len(t) < 8:
         print("your password is too short") 
         
    if t == t.lower() :
          print("your password should contain at least one uppercase letter ")
    if t == t.upper():
          print("your password should contain at least o one lowercase letter")
    t = input("what is your password? ")
def main():
    password = passwords()
    cheak(password)
main()
a = "fsfsS"
a = "fsfsS"
if a != a.upper():
      print("your password should contain at least one uppercase letter")

count = sum(1 for c in a if c.islower())

print(count > 0)
print(any(c.islower() for c in a))
print(any(c.isupper() for c in a))
if a.islower() == True:
      print("your password should contain at least one uppercase letter")

def check_letters(text):
    has_lower = any(c.islower() for c in text)
    has_upper = any(c.isupper() for c in text)

    print("אותיות קטנות:", has_lower)
    print("אותיות גדולות:", has_upper)

check_letters("fsfsS")

import re
a = "fsfsS"
if re.search(r"[a-z]",a):
     print("your password should contain at least one uppercase letter")

names ={}
a = input("what is your name? ")
names[23] = a
print(names)

import random
secret_number = random.randint(1, 100)
guess = input("Guess the secret number between 1 and 100: ")
while guess !=secret_number:
     print("Wrong guess, try again.")
     guess = input("Guess the secret number between 1 and 100: ")
print("Congratulations! You guessed the secret number.", secret_number)

nums = [1, 2, 3, 4]
def square(x):
    return x**2

result = list(map(square, nums))
print(result)
result = list(map(lambda x: x**2, nums))
res = [x**2 for x in nums]
print(result, res)
words = ["hello", "world", "python"]
upper = list(map(str.upper, words))
print(upper)



nums = [1, 2, 3, 4]
result = list(map(lambda x: x**2 , nums))
print(result)
nums = [1,2,3,4,5,6]
res = list(map(lambda x:"even" if x%2==0 else "odd",nums))

print(res)
nums = [1,2,3,4,5,6]

res = list(filter(lambda x: x%2==0,nums))
print(res)

words = ["hello", "world", "python"]
a = list(map(len, words))
print(a)
lens =  list(map(lambda x: len(x), words))
print(lens)
upps =  list(map(lambda x: x.upper(), words))
print(upps)

words = ["hi", "cat", "elephant"]
a = list(map(lambda x: "shors" if len(x)<3 else "long", words))

nums = [10, 25, 30, 5, 60]
a = list(filter(lambda x: x>20, nums))
a = [x * x for x in range(1,6)]
print(a)

num1=10
num2=0
try:
     num1/num2
except Exception as error:
     print(error)

import time
a = time.ctime()
b= time.sleep(4)
print(a)

import socket
socket.

import requests
r = requests.get("https://ynet.co.il")
print(r.text)
import hashlib
t = input("write here ")
a= hashlib.md5(t.encode())
print(a.digest())

import hashlib
print(hashlib.sha256(b"password").hexdigest())
print(c"hey")

import requests

url = "https://httpbin.org/get"

response = requests.get(url)

print("Status:", response.status_code)
print("Headers:", response.headers)

passwords = ["1234", "admin", "password", "letmein"]

real_password = "admin"

for pwd in passwords:
    if pwd == real_password:
        print(f"Found password: {pwd}")
        break

import scapy

print(dir(scapy))