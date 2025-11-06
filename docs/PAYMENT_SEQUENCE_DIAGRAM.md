# Payment Sequence Diagram - SePay Integration

## Quy trình thanh toán qua SePay

```mermaid
sequenceDiagram
    participant Client as Mobile App<br/>(Client)
    participant API as Backend API<br/>(Express)
    participant DB as MongoDB
    participant SePay as SePay Service
    participant Bank as Ngân hàng
    participant User as End User<br/>(Khách hàng)

    Note over Client,User: Bước 1: Tạo QR Payment
    Client->>API: POST /api/v1/payment/create-qr<br/>{amount, description, referenceId}
    API->>API: Tạo mã CODE unique<br/>(từ referenceId hoặc UUID)
    API->>API: Tạo content với CODE<br/>"description CODE:XXXX"
    API->>API: Build QR URL<br/>qr.sepay.vn/img?acc=...&bank=...&amount=...&des=...
    API-->>Client: Response: {qrUrl, amount, bank, accountNumber, content, code}
    Client->>Client: Hiển thị QR Code cho user

    Note over Client,User: Bước 2: User quét QR và thanh toán
    User->>User: Mở app ngân hàng<br/>Quét QR Code
    User->>Bank: Chuyển khoản với<br/>nội dung: "description CODE:XXXX"
    Bank->>SePay: Giao dịch chuyển khoản<br/>với nội dung chứa CODE
    SePay->>SePay: Nhận diện CODE<br/>từ nội dung chuyển khoản

    Note over Client,User: Bước 3: SePay gọi webhook
    SePay->>API: POST /api/v1/payment/webhook<br/>{id, gateway, transferAmount, content, code, ...}
    API->>API: Verify API Key<br/>(nếu có trong header)
    API->>API: Validate payload<br/>(kiểm tra sepayId)
    API->>DB: Upsert PaymentTransaction<br/>(idempotent by sepayId)
    API->>DB: Tìm Appointment theo CODE<br/>trong content
    alt Tìm thấy Appointment
        API->>DB: Update Appointment status<br/>status = "PAID"
    end
    API-->>SePay: Response: {success: true}<br/>HTTP 201
    SePay->>SePay: Đánh dấu webhook thành công

    Note over Client,User: Bước 4: Client check trạng thái
    Client->>API: GET /api/v1/appointment/{id}
    API->>DB: Query Appointment
    DB-->>API: Appointment data<br/>(status = "PAID")
    API-->>Client: Response với status đã cập nhật

    Note over Client,User: Lưu ý: Retry mechanism
    alt Webhook thất bại (network error)
        SePay->>SePay: Đánh dấu webhook thất bại
        Note over SePay: Retry theo Fibonacci<br/>tối đa 7 lần trong 5 giờ
        SePay->>API: Retry POST /api/v1/payment/webhook
        API-->>SePay: Response: {success: true}
    end
```

## Chi tiết các bước

### 1. Tạo QR Payment (Client → API)
- **Request:**
  ```json
  POST /api/v1/payment/create-qr
  {
    "amount": 2277000,
    "description": "Thanh toan don #1234",
    "referenceId": "ORDER_1234"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "qrUrl": "https://qr.sepay.vn/img?acc=...&bank=...&amount=...&des=...",
      "code": "ABCD123456"
    }
  }
  ```

### 2. User thanh toán (User → Bank → SePay)
- User quét QR bằng app ngân hàng
- App tự điền thông tin: số tài khoản, số tiền, nội dung
- User xác nhận chuyển khoản
- Bank xử lý giao dịch
- SePay nhận thông báo từ ngân hàng

### 3. Webhook từ SePay (SePay → API)
- **Request từ SePay:**
  ```json
  POST /api/v1/payment/webhook
  Header: Authorization: Apikey <SEPAY_API_KEY>
  {
    "id": 92704,
    "gateway": "Vietcombank",
    "transferAmount": 2277000,
    "content": "Thanh toan don #1234 CODE:ABCD123456",
    "code": "ABCD123456",
    "transferType": "in",
    ...
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "id": 92704
  }
  ```
- **HTTP Status:** 201 (hoặc 200)

### 4. Xử lý trong Backend
1. Lưu giao dịch vào `PaymentTransaction` (idempotent)
2. Tìm CODE trong `content` field
3. Match CODE với `Appointment` (nếu có)
4. Cập nhật `Appointment.status = "PAID"`

## Flowchart: Payment Flow

```mermaid
flowchart TD
    A[Client tạo QR Payment] --> B[API tạo CODE unique]
    B --> C[Build QR URL với SePay]
    C --> D[Client hiển thị QR Code]
    D --> E[User quét QR bằng app ngân hàng]
    E --> F[User chuyển khoản]
    F --> G[Bank xử lý giao dịch]
    G --> H[SePay nhận thông báo]
    H --> I{SePay nhận diện CODE?}
    I -->|Có| J[SePay gọi webhook]
    I -->|Không| K[Không gọi webhook]
    J --> L[API xác thực webhook]
    L --> M{Valid?}
    M -->|Không| N[Return 401/400]
    M -->|Có| O[Lưu PaymentTransaction]
    O --> P[Tìm Appointment theo CODE]
    P --> Q{Appointment found?}
    Q -->|Có| R[Update status = PAID]
    Q -->|Không| S[Chỉ lưu giao dịch]
    R --> T[Return success: true]
    S --> T
    T --> U[SePay đánh dấu thành công]
    
    N --> V{Network error?}
    V -->|Có| W[SePay retry sau]
    V -->|Không| X[SePay không retry]
```

## Database Schema liên quan

### PaymentTransaction
- `sepayId` (unique) - ID từ SePay
- `code` - Mã CODE trong content
- `transferAmount` - Số tiền
- `content` - Nội dung chuyển khoản
- `relatedAppointmentId` - Link đến Appointment (nếu có)

### Appointment
- `status` - PENDING → PAID (sau khi nhận webhook)
- `customerEmail` - Email khách hàng
- `serviceTypeIds` - Danh sách dịch vụ

## Error Handling

### 1. Webhook thất bại
- SePay retry tự động (theo Fibonacci, max 7 lần)
- Backend phải idempotent (không duplicate khi retry)

### 2. CODE không tìm thấy
- Vẫn lưu giao dịch vào `PaymentTransaction`
- Không update `Appointment` nếu không match CODE

### 3. Duplicate payment
- Kiểm tra `sepayId` unique trong database
- Upsert thay vì insert để tránh duplicate

## Security

1. **API Key Authentication** - SePay gửi header `Authorization: Apikey <KEY>`
2. **Idempotency** - Dùng `sepayId` để đảm bảo không xử lý trùng
3. **Validation** - Validate payload từ SePay trước khi xử lý

