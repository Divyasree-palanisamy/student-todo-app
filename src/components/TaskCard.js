import { motion } from 'framer-motion';

function TaskCard({ task, index, completeTask, deleteTask }) {
  return (
    <motion.div
      className="bg-white rounded-xl p-4 shadow-lg text-black"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-semibold">{task.title}</h3>
      <p className="text-gray-600">{task.description}</p>
      <div className="flex gap-2 mt-4">
        {!task.completed && (
          <button
            onClick={() => completeTask(index)}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Complete
          </button>
        )}
        <button
          onClick={() => deleteTask(index)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}

export default TaskCard;
