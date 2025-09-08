
export interface User{
    id: string;//uuid from the Users authentication table Primary key
    firstname: string;
    surname: string
    email: string;//unique
    studentNum: string;//unique
    role: role;
    faculty: string;
    currCourse: string;//Foreign key to Course.courseCode
    image: string;
}

export interface Course{
    id: number;//Primary key
    courseCode: string;//unique
    faculty: string;
    courseName: string;
}

export interface Module{
    id: number;//Primary key
    moduleCode: string;//Not unique as multiple years and semesters can have the same module
    courseCode: string;//Foreign key to Course.courseCode
    year: number;
    semester: number;
    lecturerId: string;//Foreign key to User.id
}

export interface Venue{
    id: number;//Primary key
    roomNum: string;
    campus: string;
    latitude: number;
    longitude: number;
}

export interface StudentModule{
    id: number;//Primary key
    current: boolean;
    mark: number;
    moduleId: number;//Foreign key to Module.id
    studentId: string;//Foreign key to User.id
}

export interface Schedule{
    id: number;//Primary key
    type: string;
    moduleId: number;//Foreign key to Module.id
    venueId: number;//Foreign key to Venue.id
    weekDay: weekDay;
    startTime: string;
    endTime: string;
}

export interface Event{
    id: number;//Primary key
    status: status;
    date: string;
    scheduleId: number;//Foreign key to Schedule.id
}

export interface Attendance{
    id: number;//Primary key
    eventId: number;//Foreign key to Event.id
    in: boolean;
    out: boolean;
    userId: string;
}

enum status {
    upcoming = "upcoming",
    completed = "completed",
    current = "ongoing"
}

enum weekDay {
    Monday = "Monday",
    Tuesday = "Tuesday",
    Wednesday = "Wednesday",
    Thursday = "Thursday",
    Friday = "Friday",
    Saturday = "Saturday",
    Sunday = "Sunday"
}

enum role {
    student = "student",
    admin = "admin",
    lecturer = "lecturer"
}