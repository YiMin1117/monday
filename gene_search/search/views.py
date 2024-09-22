from django.shortcuts import render
from django.http import HttpResponse #匯入http模組
def hello_world(request):
    return HttpResponse("Hello World!")
