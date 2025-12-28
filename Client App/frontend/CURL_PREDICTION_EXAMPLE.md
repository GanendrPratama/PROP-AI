# Contoh CURL untuk API Prediction

## Endpoint
```
POST http://localhost:8000/prediction
```

## Header
```
Content-Type: application/json
```

## Format Request Body
```json
{
  "location": "Beji, Depok",
  "bedrooms": 3,
  "toilet": 2,
  "garage": 1,
  "LT": 100,
  "LB": 120
}
```

### Parameter Explanation:
- `location`: Lokasi properti (string)
- `bedrooms`: Jumlah kamar tidur (integer)
- `toilet`: Jumlah kamar mandi (integer)
- `garage`: Kapasitas garasi (integer)
- `LT`: Luas Tanah dalam m² (integer)
- `LB`: Luas Bangunan dalam m² (integer)

## Contoh CURL Command (Windows PowerShell)

### Basic Request
```powershell
curl -X POST http://localhost:8000/prediction `
  -H "Content-Type: application/json" `
  -d '{\"location\":\"Beji, Depok\",\"bedrooms\":3,\"toilet\":2,\"garage\":1,\"LT\":100,\"LB\":120}'
```

### Request dengan File JSON
Buat file `prediction-request.json`:
```json
{
  "location": "Beji, Depok",
  "bedrooms": 3,
  "toilet": 2,
  "garage": 1,
  "LT": 100,
  "LB": 120
}
```

Kemudian jalankan:
```powershell
curl -X POST http://localhost:8000/prediction `
  -H "Content-Type: application/json" `
  -d '@prediction-request.json'
```

### Request dengan curl.exe (Native Windows)
```powershell
curl.exe -X POST http://localhost:8000/prediction `
  -H "Content-Type: application/json" `
  --data-raw '{\"location\":\"Beji, Depok\",\"bedrooms\":3,\"toilet\":2,\"garage\":1,\"LT\":100,\"LB\":120}'
```

## Contoh Response
```json
{
  "predicted_price_raw": 1856708391.4431982,
  "predicted_price_formatted": "Rp 1,856,708,391",
  "most_influential_feature": "Location",
  "feature_importance": [
    {
      "Feature": "Location",
      "Percentage": 24.802021354749375
    },
    {
      "Feature": "LB",
      "Percentage": 18.744256854235626
    },
    {
      "Feature": "LT",
      "Percentage": 17.103692750000615
    },
    {
      "Feature": "toilet",
      "Percentage": 14.623962629557166
    },
    {
      "Feature": "garage",
      "Percentage": 12.537680478552646
    },
    {
      "Feature": "bedrooms",
      "Percentage": 12.18838593290457
    }
  ]
}
```

## Testing dari Frontend

File `src/services/predict.js` sudah dikonfigurasi untuk:
1. Mengubah format payload frontend ke format API backend
2. Menunggu response dari server dengan timeout 30 detik
3. Mentransformasi response API ke format yang digunakan frontend
4. Logging detail untuk debugging

### Mapping Frontend ke Backend:
- `landSize` → `LT` (Luas Tanah)
- `buildingArea` → `LB` (Luas Bangunan)
- `bathrooms` → `toilet`
- `garageCapacity` → `garage`
- `bedrooms` → `bedrooms` (sama)
- `location` → `location` (sama)

Pastikan server prediction berjalan di port 8000 sebelum menjalankan frontend.

## Troubleshooting

### CORS Error
Jika mendapat CORS error, pastikan backend Python Anda sudah mengaktifkan CORS:
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
```

### Connection Refused
Pastikan server prediction berjalan di `localhost:8000`:
```bash
# Cek apakah port 8000 sudah digunakan
netstat -ano | findstr :8000
```

### Timeout
Jika request timeout, coba tingkatkan timeout di `predict.js` (saat ini 10 detik).
