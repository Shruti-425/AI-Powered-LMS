import CourseCard from "./CourseCard";

function CourseList() {

  const courses = [
    {
      title: "Data Structures",
      instructor: "Dr. Sharma",
      progress: 75
    },
    {
      title: "Cloud Computing",
      instructor: "Prof. Verma",
      progress: 60
    },
    {
      title: "DBMS",
      instructor: "Dr. Gupta",
      progress: 90
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">

      {courses.map((course, index) => (
        <CourseCard
          key={index}
          {...course}
        />
      ))}

    </div>
  );
}

export default CourseList;