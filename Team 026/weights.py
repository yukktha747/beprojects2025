class_counts = {
    'Bulb': 106,
    'Keyboard': 428,
    'Mobile': 780,
    'Mouse': 299,
    'Printer': 1525,
    'Battery': 810,
    'Camera': 633,
    'Laptop': 1046
}

total_samples = sum(class_counts.values())
class_weights = {class_name: total_samples / count for class_name, count in class_counts.items()}

print(class_weights)