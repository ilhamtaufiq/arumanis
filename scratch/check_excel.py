import pandas as pd
import sys

file_path = r'c:\laragon\www\bun\template_kontrak-1.xlsx'
try:
    df = pd.read_excel(file_path)
    print(f"Total rows (excluding header): {len(df)}")
    duplicates = df[df.duplicated(subset=['Nama Paket'], keep=False)]
    if not duplicates.empty:
        print("\nDuplicate 'Nama Paket' found:")
        print(duplicates[['Nama Paket']])
    else:
        print("\nNo duplicate 'Nama Paket' found.")
    
    # Check for leading/trailing spaces
    print("\nChecking for leading/trailing spaces:")
    df['Paket_Strip'] = df['Nama Paket'].astype(str).str.strip()
    df['Penyedia_Strip'] = df['Nama Penyedia'].astype(str).str.strip()
    
    space_paket = df[df['Nama Paket'].astype(str) != df['Paket_Strip']]
    if not space_paket.empty:
        print(f"Found {len(space_paket)} rows with leading/trailing spaces in 'Nama Paket'")
        print(space_paket[['Nama Paket']])
    else:
        print("No leading/trailing spaces in 'Nama Paket'")

    space_penyedia = df[df['Nama Penyedia'].astype(str) != df['Penyedia_Strip']]
    if not space_penyedia.empty:
        print(f"Found {len(space_penyedia)} rows with leading/trailing spaces in 'Nama Penyedia'")
        print(space_penyedia[['Nama Penyedia']])
    else:
        print("No leading/trailing spaces in 'Nama Penyedia'")

except Exception as e:
    print(f"Error: {e}")
