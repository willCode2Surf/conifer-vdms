# Easily kill process on port because firebase
# locally always fails to cleanup itself on the functions and firestore emulator ports
# kill -9 $(lsof -t -i tcp:$1)
kill -9 $(lsof -t -i tcp:5000) &
kill -9 $(lsof -t -i tcp:5001) &
kill -9 $(lsof -t -i tcp:8085) &
kill -9 $(lsof -t -i tcp:8080) &
kill -9 $(lsof -t -i tcp:9199) &
kill -9 $(lsof -t -i tcp:4500) &
kill -9 $(lsof -t -i tcp:9150) &
kill -9 $(lsof -t -i tcp:5005)