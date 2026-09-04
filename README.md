# English Raccoon – Tiếng Anh thực hành lớp 3

English Raccoon là ứng dụng web/PWA miễn phí cho trẻ 8–9 tuổi. Chương trình ưu tiên **nghe, nói và nhớ từ vựng**, đồng thời phát triển đọc hiểu và phản xạ giao tiếp. Trẻ học khoảng 15–20 phút mỗi ngày; phụ huynh giữ quyền kiểm soát dữ liệu và tiến trình.

## Mục tiêu năm học

- Hoàn thành 36 tuần × 5 buổi = 180 buổi học ngắn.
- Gặp và sử dụng 288 vị trí từ/cụm từ trọng tâm trong ngữ cảnh quen thuộc.
- Xây nền Pre-A1 vững và tiếp cận A1 theo các mô tả “can-do”, không biến ứng dụng thành công cụ luyện mẹo thi.
- Hình thành thói quen nghe trước, bắt chước theo cụm, truy hồi từ không nhìn, đọc để lấy ý và dùng tiếng Anh cho một mục đích nhỏ.

## Cấu trúc 9 thế giới

1. Hello World – bản thân, lớp học và gia đình.
2. Cosy Home – nhà ở, thói quen và đồ ăn.
3. School Quest – học tập, lịch tuần và hợp tác.
4. Heart & Friends – cơ thể, cảm xúc và sở thích.
5. Around Town – địa điểm, chỉ đường và mua sắm.
6. Wild & Wonderful – động vật, thời tiết và thiên nhiên.
7. Story Studio – trò chơi, kể chuyện và tưởng tượng.
8. Little Explorer – giác quan, vật liệu và môi trường.
9. Brave Speaker – lập kế hoạch, giải quyết vấn đề và trình bày.

Mỗi tuần có 8 từ/cụm từ, một mẫu câu chức năng, một câu mẫu, một trọng tâm âm, một đoạn đọc ngắn và câu hỏi hiểu ý. Năm buổi trong tuần lần lượt là:

1. **Tai thính** – nghe và phân biệt từ.
2. **Nói cùng Rory** – nghe mẫu, bắt chước, ghi âm và nghe lại.
3. **Mắt tinh** – nối từ với nghĩa, đọc đoạn ngắn và tìm ý.
4. **Kho từ nhớ lâu** – chủ động gọi lại từ mà không nhìn danh sách.
5. **Nhiệm vụ giao tiếp** – chọn, nghe và nói câu phù hợp với tình huống.

## Nguyên tắc giáo dục

- Từ mới được luyện nhiều lần trong nhiều hoạt động, không học danh sách rời.
- Ôn cách quãng sau 1, 3 hoặc 7 ngày tùy dấu vết học tập.
- Ba nhịp thích ứng là **Gỡ nút – Vừa sức – Bứt phá**.
- Điểm số là bằng chứng để chọn hỗ trợ tiếp theo, không dùng để gắn nhãn trẻ.
- Phần nói không dùng nhận dạng giọng máy để phán đúng/sai. Bé nghe mẫu, ghi âm, nghe lại và tự đánh giá với phụ huynh.
- Giọng đọc dùng `speechSynthesis` của thiết bị. Chất giọng và khả năng dùng khi ngoại tuyến phụ thuộc gói giọng tiếng Anh đã cài trên thiết bị.

Khung chương trình tham khảo định hướng năng lực giao tiếp của Chương trình GDPT Việt Nam, mô tả CEFR cho người học nhỏ tuổi, chủ đề/từ vựng Pre A1 Starters và các khuyến nghị dạy từ vựng chuyên sâu kết hợp ngôn ngữ nói–viết. Toàn bộ câu, đoạn đọc và hoạt động trong mã nguồn được biên soạn mới.

## Riêng tư và an toàn

- Không quảng cáo, không tracker, không đăng nhập và không gọi AI khi trẻ học.
- Tiến trình nằm trong `localStorage` với khóa `english-raccoon-learning-v1`.
- Bản ghi giọng chỉ tồn tại tạm trong bộ nhớ trình duyệt, không tải lên máy chủ và biến mất khi tải lại trang.
- Phụ huynh có thể xuất/nhập tệp JSON. Không đưa tệp hồ sơ của trẻ vào repository GitHub công khai.

## Đưa lên GitHub Pages

1. Repository chính thức: `tienganhminh3`.
2. Đưa mã nguồn lên nhánh `main`.
3. Trong **Settings → Pages**, chọn nguồn **GitHub Actions**.
4. Workflow **Deploy English Raccoon to GitHub Pages** sẽ kiểm tra nội dung, tạo bản web tĩnh và phát hành.

Workflow tự xác định `basePath` từ tên repository. Mọi tuyến quan trọng được xuất thành HTML tĩnh:

- `/assessment/`
- `/roadmap/`
- `/parent/`
- `/week/1/` đến `/week/36/`
- `/lesson/1/` đến `/lesson/180/`

`404.html` xử lý đường dẫn cũ hoặc thiếu dấu gạch chéo. Service worker lưu bản web và nội dung để học tiếp sau lần tải đầu tiên.

## Cài trên iPad

1. Mở website GitHub Pages bằng Safari khi có mạng.
2. Thử một nút **Nghe** và cho phép micro khi vào buổi **Nói cùng Rory**.
3. Chọn **Chia sẻ → Thêm vào Màn hình chính**.
4. Mở ứng dụng từ biểu tượng mới.
5. Sau buổi đầu, vào **Đồng hành → Sao lưu JSON**.

Để giọng đọc hoạt động tốt khi ngoại tuyến, nên tải sẵn một giọng English (US hoặc UK) trong phần trợ năng/ngôn ngữ của thiết bị.

## Phát triển và kiểm tra

Yêu cầu Node.js 22.13 trở lên.

```bash
npm ci
npm run content:validate
npm run lint
npm test
NEXT_PUBLIC_BASE_PATH=/tienganhminh3 npm run build:github
```

Chỉ phát hành khi kiểm tra nội dung, lint, test và static export cùng đạt. Không đưa token, dữ liệu cá nhân, bản ghi âm hoặc tệp sao lưu vào commit.

## Giới hạn của bản thử nghiệm

- Đây là bản pilot cần phụ huynh quan sát thực tế và phản hồi sau từng tuần.
- Điểm nói hiện là tự đánh giá có hướng dẫn; chưa phải đánh giá phát âm chuẩn hóa.
- Giọng TTS phụ thuộc hệ điều hành và có thể khác nhau giữa thiết bị.
- Dữ liệu chưa đồng bộ giữa nhiều thiết bị; cần sao lưu JSON trước khi xóa dữ liệu trình duyệt.
