import pandas as pd
import sys

file_path = r'c:\laragon\www\bun\template_kontrak-1.xlsx'
try:
    df = pd.read_excel(file_path)
    print("Unique Nama Paket in Excel:")
    for name in df['Nama Paket'].unique():
        print(f"PAKET: {name}")
    print("\nUnique Nama Penyedia in Excel:")
    for name in df['Nama Penyedia'].unique():
        print(f"PENYEDIA: {name}")
except Exception as e:
    print(f"Error: {e}")
