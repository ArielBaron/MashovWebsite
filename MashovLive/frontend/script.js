



document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', document.getElementById('fileInput').files[0]);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        document.getElementById('response').innerText = 'File uploaded successfully. Fetching data...';

        // Fetch behavior data
        const behaviorResponse = await fetch('/behavior');
        behaviorData = await behaviorResponse.json();
        behaviorData = behaviorData.map(obj => {
            // Remove unwanted properties
            if (obj.achvaName !== "נוכחות בשיעור מקוון") {
                delete obj.timestamp;
            }
            delete obj.reporterGuid;
            delete obj.lessonId;
            delete obj.achvaCode;
            delete obj.achvaAval;
            delete obj.justificationId;
            delete obj.studentGuid;
            delete obj.eventCode;
            delete obj.lessonType;
            delete obj.lessonReporter;
            obj.justified = obj.justified === 9 ? "מוצדק" : "לא מוצדק";
            delete obj.groupId;
            // Format lesson date
            const lessonDate = new Date(obj.lessonDate).toISOString().split('T')[0];
            obj.lessonDate = lessonDate.split("-").reverse().join("-");
            return obj;
        });
        console.log('Behavior data:', behaviorData);

        // Fetch grades data
        const gradesResponse = await fetch('/grades');
        gradesData = await gradesResponse.json();
        gradesData = gradesData.map(obj => {
            // Remove unwanted properties
            delete obj.groupId;
            delete obj.gradingPeriod;
            delete obj.gradeTypeId;
            delete obj.gradeRate;
            delete obj.id;
            delete obj.gradingEventId;
            delete obj.studentGuid;
            delete obj.rate;
            delete obj.year;
            return obj;
        });
        console.log('Grades data:', gradesData);
        
        SubjectGrades = {};
        gradesData.forEach(entry => {
            const { subjectName, grade } = entry;

            if (SubjectGrades[subjectName]) {
                SubjectGrades[subjectName].push(grade);
            } else {
                SubjectGrades[subjectName] = [grade];
            }
        });
        console.log('Subject grades:', SubjectGrades);
        // Fetch timetable data
        const timetableResponse = await fetch('/timetable');
        timetableData = await timetableResponse.json();
        timetableData = timetableData.map(obj => {
            delete obj.groupDetails.groupInactiveTeachers;
            delete obj.groupDetails.groupId;
            delete obj.groupDetails.subjectName;
            const { day, lesson } = obj.timeTable;
            obj.groupDetails.day = day;
            obj.groupDetails.lesson = lesson;
            delete obj.timeTable;
            const teacherNames = obj.groupDetails.groupTeachers.map(teacher => teacher.teacherName);
            obj.groupDetails.teacherName = teacherNames.join(", ");
            delete obj.groupDetails.groupTeachers;
            return obj;
        });

        // Split timetableData into sublists based on the day property
        timetableByDay = {};
        timetableData.forEach(obj => {
            const { day, ...rest } = obj.groupDetails;
            if (!timetableByDay[day]) {
                timetableByDay[day] = [];
            }
            timetableByDay[day].push(rest);
        });

        for (const day in timetableByDay) {
            timetableByDay[day].sort((a, b) => a.lesson - b.lesson);
        }
        console.log('Timetable data:', timetableByDay);

        // Hide the start screen and display the options
        document.getElementById("Start-Screen").style.display = "none";
        document.getElementById("Options-Screen").style.display = "block";
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'Error occurred. Please try again.';
    }
});

function option_Menu(open=true){
document.getElementById("Options-Screen").style.display = open? "block" : "none"
}

function add_Back_btn(div) {
    const btn = document.createElement("button");
    btn.style.display = "block";
    btn.textContent = "Back";
    btn.style.width = "1500px";
    btn.style.height = "50px";
    btn.onclick = () => {
        div.style.display = "none";
        option_Menu(true); // Pass 'true' to open the Options-Screen
    };
    div.appendChild(btn);
}

function Grades_page() {
    option_Menu(false);
    
    const tableContainer = document.getElementById('GTableContainer');
    tableContainer.style.display = "block";
    tableContainer.innerHTML = ''; // Clear previous content

    // Create a div to hold the sorting label and select
    const sortingContainer = document.createElement('div');
    sortingContainer.style.display = 'flex';
    sortingContainer.style.alignItems = 'center';
    sortingContainer.style.marginBottom = '10px';

    // Create and append sorting select element
    const sortingSelect = document.createElement('select');
    sortingSelect.style.marginLeft = "10px"; // Add margin to the left of the select
    const sortingOptions = [
        { value: 'timestampOtoN', text: 'תאריך (ישן-חדש)' },
        { value: 'timestampNtoO', text: '(חדש-ישן) תאריך' },
        { value: 'grade', text: 'ציון' },
        { value: 'subjectName', text: 'מקצוע' },
        { value: 'teacherName', text: 'מורה' }
    ];
    sortingOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        sortingSelect.appendChild(optionElement);
    });
    sortingContainer.appendChild(sortingSelect);

    // Create and append sorting label
    const sortingLabel = document.createElement('label');
    sortingLabel.textContent = ":תארגן לפי";
    sortingContainer.appendChild(sortingLabel);

    tableContainer.appendChild(sortingContainer);

    // Add event listener for sorting
    sortingSelect.addEventListener('change', function() {
        const selectedOption = sortingSelect.value;
        sortAndDisplayTable(selectedOption);
    });

    // Function to sort and display table
    function sortAndDisplayTable(sortBy) {
        // Sort the gradesData based on the selected option
        if (sortBy === 'timestampOtoN') {
            gradesData.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        } 
        else if (sortBy === 'timestampNtoO') {
            gradesData.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        }
        else if (sortBy === 'grade') {
            gradesData.sort((a, b) => a.grade - b.grade);
        } 
        else if (sortBy === 'subjectName') {
            gradesData.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
        } 
        else if (sortBy === 'teacherName') {
            gradesData.sort((a, b) => a.teacherName.localeCompare(b.teacherName));
        }

        // Clear previous table
        const previousTable = document.getElementById('gradesTable');
        if (previousTable) {
            tableContainer.removeChild(previousTable);
        }

        // Create and append the sorted table
        const table = buildTable(gradesData, false);
        tableContainer.appendChild(table);
    }

    // Initial display of the table
    const table = buildTable(gradesData, false); // Include timestamp
    add_Back_btn(tableContainer);
    tableContainer.appendChild(table);
}




function calculateB(behavior){
    // GET ALL achvaName
    // calculate ratio
    let basic_mistakes_c = 0;
    for(index in behavior){
        dict = behavior[index];
        if(dict['justified']==="לא מוצדק" && !("נוכחות בשיעור מקוון ללא ש.ב. מילה טובה חיסור".includes(dict.achvaName))){
            basic_mistakes_c++;
        }
    }
    return Math.max(5,10-Math.floor(basic_mistakes_c/4))

}
function Avg_page() {
    option_Menu(false);
    
    // Ensure SubjectGrades is defined
    if (typeof SubjectGrades === 'undefined') {
        console.error("SubjectGrades is not initialized yet.");
        return;
    }
    
    const averageGrades = {};
    let c =0
    for (const subjectName in SubjectGrades) {
        const grades = SubjectGrades[subjectName];
        const sum = grades.reduce((acc, curr) => acc + curr, 0);
        let average = sum / grades.length;
        c+=average
        averageGrades[subjectName] = average;
    }
    
    // Convert averageGrades object to an array of objects
    const averageGradesArray = Object.entries(averageGrades).map(([subjectName, average]) => ({ subjectName, average }));
    

    
    const table = buildTable(averageGradesArray, false, true); // Include additional columns
    
    // Create a new row for additional data
    const additionalRow = table.insertRow();
    const additionalCell1 = additionalRow.insertCell();
    additionalCell1.textContent = 'ממוצע כללי';
    const additionalCell2 = additionalRow.insertCell();
    additionalCell2.textContent = c/Object.keys(SubjectGrades).length;
    
    const tableContainer = document.getElementById('GTableContainer');
    tableContainer.innerHTML = ''; // Clear previous table
    tableContainer.style.display = "block";
    add_Back_btn(tableContainer);
    tableContainer.appendChild(table);
}

function TimeTable_page() {
    option_Menu(false);

    // Ensure timetableByDay is defined
    if (!timetableByDay) {
        console.error("Timetable data is not initialized yet.");
        return;
    }

    // Get the table container element
    const tableContainer = document.getElementById('GTableContainer');
    // Clear previous tables from the container
    tableContainer.innerHTML = '';
    add_Back_btn(tableContainer)
    tableContainer.style.display = "block";
    // Iterate through each day in timetableByDay
    for (const day in timetableByDay) {
        // Create a container for the current day's table and heading
        const dayContainer = document.createElement('div');
        dayContainer.style.display = "inline-block"; // Keep the containers inline
        dayContainer.style.marginRight = "25px"; // Add horizontal gap between each day's container
        dayContainer.style.fontSize = "20px"
        dayContainer.style.border = "#000000 solid 5px"
        // Create a table for the current day
        const table = createScheduleTable(timetableByDay[day]);

        // Create a heading for the day
        const heading = document.createElement('h2');
        heading.textContent = `Day ${day}`;

        // Append the heading and table to the day container
        dayContainer.appendChild(heading);
        dayContainer.appendChild(table);

        // Append the day container to the table container
        tableContainer.appendChild(dayContainer);
    }
}

function Behavior_page() {
    option_Menu(false);
    // Fetch behavior data if available
    if (!behaviorData) {
        console.error("Behavior data is not initialized yet.");
        return;
    }
    // Create table for behavior data
    const table = buildTable(behaviorData, true); // Include timestamp
    const tableContainer = document.getElementById('BehaivorContainer');
    tableContainer.innerHTML = ''; // Clear previous table
    tableContainer.style.display = "block";

    const showButton = document.createElement('button');
    showButton.textContent = "SHOW Behavior Grade";
    showButton.onclick = () => {
        if (table.style.display === "none") {
            table.style.display = "table";
            // Remove the grade label if it exists
            const gradeLabel = tableContainer.querySelector('.grade-label');
            if (gradeLabel) {
                gradeLabel.remove();
            }
            return;
        }
        table.style.display = "none";
        const grade = calculateB(behaviorData);
        // Create and append the grade label
        const gradeSpan = document.createElement('span');
        gradeSpan.className = 'grade-label';
        // Include grade and corresponding text in the text content
        gradeSpan.textContent = `${grade} ${grade > 6 ? "עובר/ת" : "לא עובר/ת"}`;
        // Set background color based on grade
        const bg_c = grade > 6 ?  "rgb(173, 255, 47)": "rgb(255, 0, 0)";

        gradeSpan.style.backgroundColor = bg_c;
        tableContainer.appendChild(gradeSpan);
    };
    tableContainer.appendChild(showButton);

    add_Back_btn(tableContainer);
    tableContainer.appendChild(table);
}

function createScheduleTable(scheduleData) {
    // Create a table element
    const table = document.createElement('table');

    // Add a header row
    const headerRow = table.insertRow();
    const headers =   ['Group Name',  'Teacher Name'];
    headers.forEach((headerText) => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    // Add rows for each schedule entry
    scheduleData.forEach((entry) => {
        const row = table.insertRow();
        for (const key in entry) {
            if(key !== 'lesson'){
                const cell = row.insertCell();
                cell.style.margin = "25px"
                cell.textContent = entry[key]; 
            }
        }
    });

    return table;
}
function buildTable(data, includeTimestamp = false) {
// Create a table element with an ID
const table = document.createElement('table');
table.id = 'gradesTable'; // Add an ID to the table
table.style.display = "table"

// Create a table header row
const headerRow = table.insertRow();
for (const key in data[0]) {
    if (data[0].hasOwnProperty(key) && (includeTimestamp || key !== 'timestamp')) {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    }
}

// Create table rows and cells
data.forEach(obj => {
    const row = table.insertRow();
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && (includeTimestamp || key !== 'timestamp')) {
            const cell = row.insertCell();
            // Convert date strings to a readable format
            if (key === 'eventDate' || key === 'timestamp') {
                cell.textContent = new Date(obj[key]).toLocaleString().replace(", 0:00:00","");
            } else {
                cell.textContent = obj[key];
            }
        }
    }
    });

return table;
}
