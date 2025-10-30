// src/pages/ViewDeletedQuizzes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Trash2,
  Loader2,
  RotateCcw,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";
import toast from "react-hot-toast";

// const BASE_API_URL = 'http://localhost:5000/quiz';

// -------------------------------------------------------------------
// --- MODAL COMPONENT (FOR REVIEWING QUIZ BEFORE DELETION) ---
// -------------------------------------------------------------------

// const QuizReviewModal = ({ quiz, onClose, onPermanentDelete }) => {
//   if (!quiz) return null;

//   const modalVariants = {
//     hidden: { opacity: 0, y: -50, scale: 0.8 },
//     visible: { opacity: 1, y: 0, scale: 1 },
//     exit: { opacity: 0, y: 50, scale: 0.8 },
//   };

//   const formatDate = (dateString) =>
//     new Date(dateString).toLocaleDateString("en-US", {
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });

//   return (
//     <motion.div
//       className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       onClick={onClose}
//     >
//       <motion.div
//         className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
//         variants={modalVariants}
//         initial="hidden"
//         animate="visible"
//         exit="exit"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
//           <h3 className="text-2xl font-extrabold text-cyan-600">
//             Review Deleted Quiz
//           </h3>
//           <motion.button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-800 transition"
//             whileHover={{ rotate: 90 }}
//           >
//             <XCircle size={24} />
//           </motion.button>
//         </div>

//         <h2 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h2>
//         <p className="text-sm text-gray-500 mb-4">{quiz.description}</p>

//         {/* Questions List */}
//         <div className="space-y-4 p-3 rounded-lg border border-cyan-100 bg-cyan-50">
//           {Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
//             quiz.questions
//               .filter((q) => q && q.questionText) // ✅ only render valid questions
//               .map((q, qIndex) => (
//                 <div
//                   key={qIndex}
//                   className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-cyan-400"
//                 >
//                   <p className="font-semibold text-gray-800 mb-2">
//                     Q{qIndex + 1}: {q.questionText}
//                   </p>
//                   <ul className="text-sm space-y-1">
//                     {(q.options || []).map((option, oIndex) => (
//                       <li
//                         key={oIndex}
//                         className={`p-1 rounded ${
//                           oIndex === q.correctAnswerIndex
//                             ? "bg-green-100 font-bold text-green-700"
//                             : "text-gray-600"
//                         }`}
//                       >
//                         {String.fromCharCode(65 + oIndex)}. {option}
//                         {oIndex === q.correctAnswerIndex && (
//                           <span className="ml-2 text-xs">(Correct Answer)</span>
//                         )}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ))
//           ) : (
//             <p className="text-gray-500 italic">
//               No questions available for this quiz.
//             </p>
//           )}
//         </div>

//         <p className="text-sm text-gray-400 mt-4">
//           Archived on: {formatDate(quiz.deletedAt)}
//         </p>

//         <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
//           <motion.button
//             onClick={() => onPermanentDelete(quiz._id)}
//             className="px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Trash2 size={16} className="inline mr-1" /> Yes, Permanently Delete
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// --- MODAL COMPONENT ---
// NOTE: This modal assumes the QUIZ MODEL stores questions as simple text/answer fields.
const QuizReviewModal = ({ quiz, onClose, onPermanentDelete, onRestore }) => { // <-- ADD onRestore
    if (!quiz) return null;
    
    const modalVariants = {
        hidden: { opacity: 0, y: -50, scale: 0.8 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 50, scale: 0.8 },
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    return (
        <motion.div 
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                    <h3 className="text-2xl font-extrabold text-cyan-600">Review Deleted Quiz Question</h3>
                    <motion.button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition" whileHover={{ rotate: 90 }}>
                        <XCircle size={24} />
                    </motion.button>
                </div>

                <div className="mb-4 p-4 rounded-lg border border-purple-200 bg-purple-50">
                    <p className="text-sm font-semibold text-purple-700 mb-2">Category: {quiz.category}</p>
                    <h2 className="text-xl font-bold text-gray-800">
                        <HelpCircle size={20} className="inline mr-2 text-purple-500"/>{quiz.question}
                    </h2>
                </div>
                
                {/* Correct Answer Display */}
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm font-bold text-green-700 mb-1">Stored Correct Answer:</p>
                    <p className="text-base text-green-900 font-medium">"{quiz.correctAnswer}"</p>
                </div>

                <p className="text-sm text-gray-400 mt-4">
                    Archived on: {formatDate(quiz.deletedAt)}
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    {/* RESTORE BUTTON IN MODAL */}
                    <motion.button
                        onClick={() => onRestore(quiz._id)}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RotateCcw size={16} className="inline mr-1"/> Restore
                    </motion.button>
                    
                    {/* PERMANENT DELETE BUTTON IN MODAL */}
                    <motion.button
                        onClick={() => onPermanentDelete(quiz._id)}
                        className="px-4 py-2 bg-red-700 text-white font-medium rounded-xl hover:bg-red-800 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Trash2 size={16} className="inline mr-1"/> Permanently Delete
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---
const ViewDeletedQuizzes = () => {
  const navigate = useNavigate();

  const [deletedQuizzes, setDeletedQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // --- FETCH DELETED QUIZZES FUNCTION ---
  const fetchDeletedQuizzes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.get(`/couple-quiz/view-all-deleted-quizzes`);
    //   console.log(response.data);
      setDeletedQuizzes(response.data.deletedQuizzes);
    //   console.log(deletedQuizzes);
    } catch (err) {
      console.error("Fetch Deleted Error:", err);
      setError("Could not load deleted quizzes. Check server.");
      setDeletedQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedQuizzes();
  }, []);

  // --- 🚨 CORRECTED RESTORE HANDLER 🚨 ---
    const handleRestore = async (id) => {
        try {
            // 1. Send POST request to the restore endpoint
            await API.post(`/couple-quiz/restore/${id}`); 
            
            // 2. Remove the question from the deleted list state immediately
            setDeletedQuizzes(deletedQuizzes.filter(quiz => quiz._id !== id));
            
            // 3. Close the modal
            setSelectedQuiz(null); 
            
            // 4. Navigate the user back to the active view page
            toast.success("Question successfully restored! Redirecting to the Active Quiz page...");
            navigate('/couple-quiz/view'); 

        } catch (err) {
            console.error("Restore Error:", err);
            toast.error(`Error: Failed to restore question. Check database and model integrity.`);
        }
    };

  // --- PERMANENT DELETE FUNCTION ---
  const handlePermanentDelete = async (id) => {
    try {
      await API.delete(`/couple-quiz/permanently-delete/${id}`);
      setDeletedQuizzes(deletedQuizzes.filter((quiz) => quiz._id !== id));
      setSelectedQuiz(null); // Close the modal
      alert("Quiz permanently erased! 💀");
    } catch (err) {
      console.error("Permanent Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to permanently delete quiz.";
      alert(`Error: ${errorMessage}`);
    }
  };

  // --- RENDERING LOGIC ---
  // ... (isLoading, error, empty state logic) ...

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16 text-cyan-500">
          <Loader2 size={32} className="mx-auto animate-spin mb-3" />
          <p className="text-lg font-medium">Loading deleted quizzes...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-16 text-red-500 bg-red-100 p-6 rounded-xl border border-red-300">
          <p className="text-xl font-semibold">Error:</p>
          <p className="mt-2">{error}</p>
        </div>
      );
    }

    if (deletedQuizzes.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
          <p className="text-lg">
            The trash is empty! No quizzes have been deleted.
          </p>
          <motion.button
            onClick={() => navigate("/couple-quiz/view")}
            className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} className="inline mr-1" /> Go Back to Active
            Quizzes
          </motion.button>
        </div>
      );
    }

    // --- SUCCESSFUL LIST RENDERING ---
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <p className="text-sm text-cyan-600 font-semibold flex items-center justify-center p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
          <XCircle size={16} className="mr-2" /> These quizzes are archived.
          Click to review and permanently delete.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deletedQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              onClick={() => setSelectedQuiz(quiz)}
              className="bg-white p-4 rounded-2xl shadow-xl border-l-8 border-gray-400 opacity-80 cursor-pointer hover:opacity-100 transition duration-200 transform hover:translate-y-[-2px]"
            >
              <h3 className="text-lg font-bold text-gray-800">
                {quiz.category || "No Category"}
              </h3>
              <p className="text-sm text-gray-600 mt-2">{quiz.question}</p>
              <p className="text-xs text-gray-400 mt-1">
                Deleted At: {new Date(quiz.deletedAt).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full">
      {/* Header and Control Buttons */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
          <span className="text-cyan-600">Deleted</span> Quizzes
        </h1>

        <div className="flex space-x-3">
          {/* Back to Dashboard Button */}
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <ChevronLeft size={20} className="mr-1" />
            Dashboard
          </motion.button>

          {/* Back to Active Quizzes Button */}
          <motion.button
            onClick={() => navigate("/couple-quiz/view")}
            className="flex items-center px-4 py-2 bg-cyan-500 text-white rounded-full font-medium hover:bg-cyan-600 transition duration-150 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <HelpCircle size={20} className="mr-1" />
            Active Quizzes
          </motion.button>
        </div>
      </header>

      {/* Content Rendering */}
      {renderContent()}

      {/* --- RENDER THE MODAL --- */}
      <AnimatePresence>
        {selectedQuiz && (
          <QuizReviewModal
            quiz={selectedQuiz}
            onClose={() => setSelectedQuiz(null)}
            onPermanentDelete={handlePermanentDelete}
            onRestore={handleRestore}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewDeletedQuizzes;
