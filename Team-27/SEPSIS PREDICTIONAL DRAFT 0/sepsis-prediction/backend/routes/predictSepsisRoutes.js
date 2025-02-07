const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const router = express.Router();

// Correct paths to your Python scripts, wrapped in quotes to handle spaces
const DATA_PREPROCESSING_SCRIPT = `"D:/SEPSIS PREDICTIONAL DRAFT 0/sepsis-prediction/backend/python-scripts/data_preprocessing_balanced.py"`;
const MODEL_TRAINING_SCRIPT = `"D:/SEPSIS PREDICTIONAL DRAFT 0/sepsis-prediction/backend/python-scripts/model_training_balanced.py"`;
const GUI_SCRIPT = `"D:/SEPSIS PREDICTIONAL DRAFT 0/sepsis-prediction/backend/python-scripts/balanced_sepsis_gui.py"`;

// Route to run Python scripts
router.get("/run", (req, res) => {
  console.log("Starting Data Preprocessing...");

  // Run Data Preprocessing Python Script
  exec(`python ${DATA_PREPROCESSING_SCRIPT}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error during data preprocessing: ${stderr}`);
      return res.status(500).json({ message: "Data preprocessing failed", error: stderr });
    }

    console.log("Data Preprocessing completed successfully!");
    console.log(stdout);

    // Run Model Training Python Script
    exec(`python ${MODEL_TRAINING_SCRIPT}`, (trainErr, trainStdout, trainStderr) => {
      if (trainErr) {
        console.error(`Error during model training: ${trainStderr}`);
        return res.status(500).json({ message: "Model training failed", error: trainStderr });
      }

      console.log("Model training completed successfully!");
      console.log(trainStdout);

      // Run GUI Python Script
      exec(`python ${GUI_SCRIPT}`, (guiErr, guiStdout, guiStderr) => {
        if (guiErr) {
          console.error(`Error during GUI execution: ${guiStderr}`);
          return res.status(500).json({ message: "GUI execution failed", error: guiStderr });
        }

        console.log("GUI execution completed successfully!");
        console.log(guiStdout);

        res.json({ message: "Prediction loaded successfully", output: guiStdout });
      });
    });
  });
});

module.exports = router;
