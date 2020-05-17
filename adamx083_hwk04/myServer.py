#!/usr/bin/env python3
# See https://docs.python.org/3.x/library/socket.html
# for a description of python socket and its parameters
#
# Copyright 2019, Shaden Smith, Koorosh Vaziri,
# Niranjan Tulajapure, Ambuj Nayab,
# Akash Kulkarni, Ruofeng Liu and Daniel J. Challou
# for use by students enrolled in Csci 4131 at the University of
# Minnesota-Twin Cities only. Do not reuse or redistribute further
# without the express written consent of the authors.
#
# This is a reworked version of EchoServer to get you started.
# It responds correctly to a HEAD command.
#add the following
import socket
import os
import stat
import sys
import urllib.parse
import datetime

from threading import Thread
from argparse import ArgumentParser

BUFSIZE = 4096
#add the following
CRLF = '\r\n'
METHOD_NOT_ALLOWED = 'HTTP/1.1 405 METHOD NOT ALLOWED{}Allow: GET, HEAD, POST {}Connection: close{}{}'.format(CRLF, CRLF, CRLF, CRLF)
OK = 'HTTP/1.1 200 OK{}content-type: */*{}{}'.format(CRLF, CRLF, CRLF)
NOT_FOUND = 'HTTP/1.1 404 NOT FOUND{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
FORBIDDEN = 'HTTP/1.1 403 FORBIDDEN{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
MOVED_PERMANENTLY = 'HTTP/1.1 301 MOVED PERMANENTLY{}Location: http://www.youtube.com/{}Connection: close{}{}'.format(CRLF, CRLF, CRLF, CRLF)
NOT_ACCEPTABLE = 'HTTP/1.1 406 NOT ACCEPTABLE{}{}{}'.format(CRLF, CRLF, CRLF)

def get_contents(fname):
  with open(fname, 'rb') as f:
    return f.read()


def post_contents(data_list):
  page = '''<html>
            <head>
            <style> 
              td {
                border: 1px solid #a9b9;
                padding: 15px;
              }
              table {
                border-collapse: collapse;
                display: inline-block;
                width: 40%;
              }
              tr:nth-child(even) {
              background-color: #dbdcdb;
              }
            </style>
            </head>
            <body>
            <h1>Following Form Data Submitted successfully:</h1>
            <table>\n'''
  for field in data_list:
    f = field.split('=')[0]
    v = field.split('=')[1]
    v = urllib.parse.unquote(v)
    page += '      <tr><td>{f}</td><td>{v}</td></tr>\n'.format(f=f, v=v)
  page += '    </table>\n  <body>\n<html>'
  return page


def check_perms(resource):
    """Returns True if resource has read permissions set on 'others'"""
    stmode = os.stat(resource).st_mode
    return (getattr(stat, 'S_IROTH') & stmode) > 0

class HTTP_HeadServer: #A re-worked version of EchoServer
    def __init__(self, host, port):
        print('listening on port {}'.format(port))
        self.host = host
        self.port = port
        self.setup_socket()
        self.accept()
        self.sock.shutdown()
        self.sock.close()

    def setup_socket(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.bind((self.host, self.port))
        self.sock.listen(128)

    def accept(self):
        while True:
            (client, address) = self.sock.accept()
            #th = Thread(target=client_talk, args=(client, address))
            th = Thread(target=self.accept_request, args=(client, address))
            th.start()

# here, we add a function belonging to the class to accept
# and process a request
    def accept_request(self, client_sock, client_addr):

        print("accept request")
        data = client_sock.recv(BUFSIZE)
        req = data.decode('utf-8') #returns a string with http request

        response=self.process_request(req) #ret string with http response
        #once we get a response, we chop it into utf encoded bytes
        #and send it (like EchoClient)
        if (type(response)==str):
          response = bytes(response,"utf-8") 

        client_sock.sendall(response)
        #clean up the connection to the client
        #but leave the server socket for recieving requests open
        client_sock.shutdown(1)
        client_sock.close()
    #added method to process requests, only head is handled in this code

    def process_request(self, request):
        print('######\nREQUEST:\n{}######'.format(request))

        linelist = request.strip().split(CRLF)
        reqline = linelist[0] #get the request line
        rlwords = reqline.split() # get list of strings on request line
        if len(rlwords) == 0:
            return ''
        if rlwords[0] == 'HEAD':
            resource = rlwords[1][1:] # skip beginning /
            return self.head_request(resource)
        elif rlwords[0] == 'GET':
            resource = rlwords[1][1:]
            return self.get_request(resource)
        elif rlwords[0] == 'POST': 
            resource = rlwords[1][1:]
            return self.post_request(resource,request) 
        else: 
            return bytes(METHOD_NOT_ALLOWED,"utf-8")+bytes("METHOD_NOT_ALLOWED","utf-8")

    def head_request(self, resource):
        """Handles HEAD requests."""
        if resource == 'mytube':
          return MOVED_PERMANENTLY
        path = os.path.join('.', resource) #look in directory where server is running
        if not os.path.exists(resource):
          ret = NOT_FOUND
        elif not check_perms(resource):
          ret = FORBIDDEN
        else:
          ret = OK
        return ret
    
    def get_request(self, resource):
    	if resource == 'mytube':
    		print("redirect to mytube")
    		ret = bytes(MOVED_PERMANENTLY,'utf-8')
    	else:
    		if not os.path.exists(resource):
    			ret = bytes(NOT_FOUND,"utf-8")+get_contents("404.html") #404
	    	elif not check_perms(resource):
	    		ret = bytes(FORBIDDEN,"utf-8")+get_contents("403.html") #403
	    	else:
	    		if resource == 'mytube':
	    			print("redirect to mytube")
	    			return bytes(MOVED_PERMANENTLY,'utf-8')
	    		else:
	    			ret = bytes(OK,"utf-8")+get_contents(resource)
    	return ret 

    def post_request(self,resource,data):
      data = data.split('\r\n\r\n')[1]
      data_list = data.split('&')
      
      content = post_contents(data_list)
      
      ret =bytes(OK,"utf-8") + bytes(content,"utf-8") 
      return ret

        
#to do a get request, read resource contents and append to ret value.
#(you should check types of accept lines before doing so)
# You figure out the rest

def parse_args(): #gets host and port information 
    # parser = ArgumentParser()
    # parser.add_argument('--host', type=str, default='localhost',
    # help='specify a host to operate on (default: localhost)')
    # parser.add_argument('-p', '--port', type=int, default=9001,
    # help='specify a port to operate on (default: 9001)')
    # args = parser.parse_args()
    # return (args.host, args.port)

  parser = ArgumentParser()
  parser.add_argument('input', nargs='?' ,action='store')
  parser.add_argument('--host', type=str, default='localhost',
  help='specify a host to operate on (default: localhost)')
  parser.add_argument('-p', '--port', type=int, default=9001,
  help='specify a port to operate on (default: 9001)')
  args = parser.parse_args()
  if (args.input == None):
      return (args.host, args.port)
  return (args.host, int(args.input))

if __name__ == '__main__':
    (host, port) = parse_args()
    HTTP_HeadServer(host, port) #Formerly EchoServer