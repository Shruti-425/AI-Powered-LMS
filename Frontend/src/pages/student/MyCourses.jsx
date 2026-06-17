import DashboardLayout from "../../components/layout/DashboardLayout";
import CourseList from "../../components/course/CourseList";

function MyCourses() {
  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        My Courses
      </h1>

      <CourseList />

    </DashboardLayout>
  );
}

export default MyCourses;