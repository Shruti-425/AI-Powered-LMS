function CourseCard({ title, instructor, progress }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">

      <h2 className="text-xl font-bold text-gray-800">
        {title}
      </h2>

      <p className="text-gray-500 mt-2">
        Instructor: {instructor}
      </p>

      <div className="mt-4">
        <div className="bg-gray-200 h-3 rounded">
          <div
            className="bg-blue-600 h-3 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-sm">
          Progress: {progress}%
        </p>
      </div>

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Open Course
      </button>

    </div>
  );
}

export default CourseCard;