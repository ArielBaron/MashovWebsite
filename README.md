# Grades Management System

This project is a website using mashov api that allows users to view and sort student grades based on various criteria such as date, grade, subject, and teacher.
The system provides a user-friendly interface for managing and displaying grades data.
# Mashov Api link
https://npm.io/package/mashov-api
I use the api like so:
user inputs a json file with:
{
    "SEMEL": XXXXXX (You can get here: https://web.mashov.info/api/schools and use F3 to Find Your School),
    "YEAR": 2024,
    "ID": "XXXXXXX", // (your isreali ID)
    "PASSWORD": "XXXXXX"
}
->
Server gets data usign Mashov api and retuns the  json for:
 GradesData, BehaviorData And TimeTableData.
then the website uses these files to fromat the website.



