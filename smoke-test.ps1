$ErrorActionPreference = "Stop"

$base = "http://localhost:4000"

function PostJson([string] $url, [object] $obj, [string] $token) {
  $headers = @{}
  if ($token) { $headers["Authorization"] = "Bearer $token" }
  Invoke-RestMethod -Method Post -Uri $url -Headers $headers -ContentType "application/json" -Body ($obj | ConvertTo-Json -Depth 10)
}

function GetJson([string] $url, [string] $token) {
  $headers = @{}
  if ($token) { $headers["Authorization"] = "Bearer $token" }
  Invoke-RestMethod -Method Get -Uri $url -Headers $headers
}

$donor = PostJson "$base/api/auth/signup" @{ email = "donor@example.com"; password = "password123"; displayName = "Donor" } ""
$donorToken = $donor.token

$rec = PostJson "$base/api/auth/signup" @{ email = "rec@example.com"; password = "password123"; displayName = "Recipient" } ""
$recToken = $rec.token

$future = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")

$c1 = PostJson "$base/api/coupons" @{
  brand = "Dominos"
  code = "D-123"
  valueDescription = "50% off"
  expiryDate = $future
  category = "Food"
  revealMode = "donorApproval"
  showDonorName = $true
} $donorToken
$c1id = $c1.coupon.id

$c2 = PostJson "$base/api/coupons" @{
  brand = "Amazon"
  code = "A-999"
  valueDescription = "₹100 off"
  expiryDate = $future
  category = "Shopping"
  revealMode = "autoRelease"
  showDonorName = $true
} $donorToken
$c2id = $c2.coupon.id

$feed = GetJson "$base/api/coupons" ""

$r1 = PostJson "$base/api/coupons/$c1id/requests" @{} $recToken

$incoming = GetJson "$base/api/requests/incoming" $donorToken
$reqId = ($incoming.requests | Where-Object { $_.couponId -eq $c1id }).id
$appr = PostJson "$base/api/requests/$reqId/approve" @{} $donorToken

$d1 = GetJson "$base/api/coupons/$c1id" $recToken

$r2 = PostJson "$base/api/coupons/$c2id/requests" @{} $recToken
$d2 = GetJson "$base/api/coupons/$c2id" $recToken

$feedCoupon = $feed.coupons | Where-Object { $_.id -eq $c1id }
$feedProps = ($feedCoupon | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name)

[pscustomobject]@{
  feedHasCode                 = ($feedProps -contains "code")
  donorApprovalRequestStatus   = $r1.request.status
  donorApprovalCodeAfterApprove = $d1.coupon.code
  autoReleaseRequestStatus     = $r2.request.status
  autoReleaseCode              = $d2.coupon.code
} | ConvertTo-Json -Depth 5

