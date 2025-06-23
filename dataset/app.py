
import pandas as pd
import re

# def clean_text(text):
#     """
#     Remove unwanted characters, HTML tags, special symbols, extra spaces, etc.
#     """
#     if not isinstance(text, str):
#         return ""
#     # Remove HTML tags
#     text = re.sub(r'<.*?>', '', text)

#     # Remove URLs
#     text = re.sub(r'http\S+|www\S+', '', text)

#     # Remove non-alphabetic characters except basic punctuation
#     text = re.sub(r'[^a-zA-Z0-9\s.,!?\'\"]', '', text)

#     # Convert to lowercase
#     text = text.lower()

#     # Remove extra spaces
#     text = re.sub(r'\s+', ' ', text).strip()

#     return text




# df = pd.read_csv('True.csv')

# df = df['text'].to_frame()  # Convert to DataFrame with 'text' as column
# df = df.rename(columns={'text': 'text'})  # Ensure column is named 'text
# print(df.head())

# for col in df.index:
#     if col == 'text':
#         df[col] = df[col].apply(clean_text)
# new_df = df.dropna(subset=['text'])
# new_df['label'] = 1  # Assuming label is 0 for all rows, adjust as needed
# new_df.to_csv('true_data_cleaned.csv', index=False)




df1 = pd.read_csv('fake_data_cleaned.csv')
df2 = pd.read_csv('true_data_cleaned.csv')

# Combine using concat
combined_df = pd.concat([df1, df2], ignore_index=True)

# Save to new CSV
combined_df.to_csv('combined.csv', index=False)




