import base64
import os

filepath = 'Models_New/Stress_Risk/final_stress_model_v2.pkl'
outfile = 'Models_New/Stress_Risk/stress_b64.py'

with open(filepath, 'rb') as f:
    data = f.read()

b64_data = base64.b64encode(data).decode('utf-8')

with open(outfile, 'w', encoding='utf-8') as f:
    f.write('b64_string = "' + b64_data + '"\n')

print("Base64 file generated safely.")
