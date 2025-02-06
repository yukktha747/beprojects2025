import os

# Base path to the bulb dataset labels directory
bulb_labels_base_path = "/content/drive/MyDrive/Dataset/battery/labels"

# Function to update labels in a given folder
def update_labels(directory, old_label, new_label):
    for subdir, _, files in os.walk(directory):
        for file_name in files:
            if file_name.endswith(".txt"):
                file_path = os.path.join(subdir, file_name)
                # Read and modify the label file
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                updated_lines = []
                for line in lines:
                    parts = line.split()
                    if parts[0] == str(old_label):  # Update label
                        parts[0] = str(new_label)
                    updated_lines.append(' '.join(parts))
                # Write the updated content back to the file
                with open(file_path, 'w') as file:
                    file.write("\n".join(updated_lines))

# Update labels in both train and val subfolders
update_labels(os.path.join(bulb_labels_base_path, "train"), old_label=0, new_label=1)
update_labels(os.path.join(bulb_labels_base_path, "val"), old_label=0, new_label=1)

print("Bulb labels updated successfully for train and val!")