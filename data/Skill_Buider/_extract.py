import json


def extract_ids(input_file, output_file):
    with open(input_file, encoding="utf8") as f:
        data = json.load(f)

    attributes = [
        {
            "id": obj.get("id"),
            "question_type": obj.get("question_type"),
            "question_content": obj.get("question_content"),
            "answer_choices": obj.get("answer_choices"),
        }
        for obj in data
        if all(
            key in obj
            for key in ["id", "question_type", "question_content", "answer_choices"]
        )
    ]

    with open(output_file, "w") as f:
        json.dump(attributes, f, indent=4)

    print(f"Extracted IDs have been saved to {output_file}")


extract_ids("DEA.json", "output.json")
