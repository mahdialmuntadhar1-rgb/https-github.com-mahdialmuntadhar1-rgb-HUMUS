# Populate Shaku Maku from erbilapify businesses
$URL = "https://hsadukhmcclwixuntqwu.supabase.co/rest/v1"
$KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY"
$headers = @{ "apikey" = $KEY; "Authorization" = "Bearer $KEY"; "Content-Type" = "application/json" }

Write-Host "🔍 Pulling data from 'erbilapify'..." -ForegroundColor Cyan

# Fetch real IDs and names from your business directory
$data = Invoke-RestMethod -Uri "$URL/erbilapify?select=id,name,city,category&limit=50" -Headers $headers

if (!$data -or $data.Count -eq 0) {
    Write-Host "❌ Still no data found in erbilapify. Check if the table has rows in the dashboard!" -ForegroundColor Red
    return
}

$templates = @(
    "✨ اكتشفوا {0} في قلب {1}! أفضل وجهة للـ {2}. #شاكو_ماكو",
    "📍 هل جربتم {0}؟ متواجدون في {1} لأفضل خدمات الـ {2}. ✨",
    "🔥 جديدنا في {1}: {0}. وجهتكم للتميز في {2}! 🚀"
)

$finalPosts = foreach ($biz in $data) {
    $temp = $templates[(Get-Random -Maximum $templates.Count)]
    @{
        business_id = [string]$biz.id
        caption     = $temp -f $biz.name, $biz.city, $biz.category
        image_url   = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop"
        likes_count = (Get-Random -Minimum 50 -Maximum 500)
    }
}

$json = $finalPosts | ConvertTo-Json -Depth 5 -Compress
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)

Invoke-RestMethod -Uri "$URL/business_postcards" -Method Post -Headers $headers -Body $bytes
Write-Host "✅ Shaku Maku populated with 50 real business postcards!" -ForegroundColor Green
