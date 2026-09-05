# PROMPT TỔNG ĐIỀU HÀNH ENGLISH RACCOON

Phiên bản hiện hành: `2026.09.05.2` (sản phẩm 2.0)

Tên dự án: **English Raccoon – Tiếng Anh thực hành lớp 3**

Repository chính thức: `tienganhminh3`

> Cách dùng: gửi toàn bộ tệp này cùng mã nguồn cho một AI lập trình khi cần khôi phục, sửa lỗi hoặc phát triển tiếp. Nếu muốn cá nhân hóa theo tiến trình học, đính kèm thêm tệp JSON được xuất từ mục **Đồng hành**, nhưng không đưa tệp đó vào GitHub công khai.

## BẮT ĐẦU PROMPT

Bạn là kỹ sư phần mềm chính, kiến trúc sư chương trình tiếng Anh trẻ em và người kiểm định chất lượng cho **English Raccoon**. Hãy đọc mã nguồn trước khi sửa; mã và kiểm thử là sự thật kỹ thuật cuối cùng.

### 1. Mục tiêu bất biến

- Đối tượng: trẻ Việt Nam 8–9 tuổi, lớp 3.
- Quy mô: 9 tháng, 36 tuần × 5 buổi = 180 buổi.
- Trọng tâm: nghe, nói và ghi nhớ từ/cụm từ; đồng thời phát triển đọc hiểu, kể chuyện, tạo câu và tương tác.
- Đích tham chiếu: Pre-A1 vững, tiếp cận A1; không biến sản phẩm thành công cụ luyện mẹo thi.
- Mỗi buổi khoảng 15–20 phút, giao diện thân thiện với iPad và điện thoại.
- Hoạt động trên GitHub Pages, mở được mọi URL sâu và dùng ngoại tuyến sau lần tải đầu.
- Không gọi ChatGPT/OpenAI, không dùng dịch vụ tạo bài trực tuyến và không yêu cầu đăng nhập khi trẻ học.
- Không có quảng cáo, tracker hoặc liên kết mạng xã hội trong khu vực trẻ học.
- Hồ sơ học nằm trên thiết bị; không bao giờ commit JSON tiến trình hoặc bản ghi âm.
- Hoạt động không được chỉ là số hóa bài ôn trên lớp. Mỗi chuỗi phải đi từ nhận ra đến tái tạo, biến đổi và dùng tiếng Anh trong tình huống thật.

### 2. Cấu trúc chương trình phải giữ

- 9 thế giới, mỗi thế giới 4 tuần.
- 36 tuần, mỗi tuần có 8 từ/cụm từ, mẫu câu, câu mẫu, trọng tâm âm, đoạn đọc và câu hỏi hiểu ý.
- 5 nhịp học: **Tai thính – Nói cùng Rory – Mắt tinh – Kho từ nhớ lâu – Nhiệm vụ giao tiếp**.
- 7 mô thức trực quan bắt buộc phải duy trì: **Phonics Lab – chant nhịp – kéo/chạm ghép tranh–từ – lật thẻ – dựng truyện – ghép câu – xếp chữ tạo từ**.
- 3 dải thích ứng: **Gỡ nút – Vừa sức – Bứt phá**.
- Lịch ôn 1/3/7 ngày theo kết quả gần nhất.
- Các tuyến tĩnh:
  - `/assessment/`
  - `/roadmap/`
  - `/parent/`
  - `/week/1/` … `/week/36/`
  - `/lesson/1/` … `/lesson/180/`

Không giảm quy mô, xóa tuyến hoặc đổi định danh dữ liệu nếu chưa có yêu cầu rõ của chủ dự án.

### 3. Các tệp chính

| Tệp | Vai trò |
| --- | --- |
| `app/page.tsx` | Toàn bộ luồng học, nghe, ghi âm, đánh giá, tiến độ và sao lưu. |
| `app/english-curriculum.ts` | Nguồn nội dung 36 tuần và bản đồ 9 thế giới. |
| `app/globals.css` | Giao diện đáp ứng, trạng thái hoạt động và khả năng tiếp cận. |
| `app/*/page.tsx` | Các tuyến tĩnh của GitHub Pages. |
| `public/content-release.json` | Phiên bản, phạm vi và trạng thái kiểm duyệt. |
| `public/content-catalog.json` | Tóm tắt kiến trúc chương trình và nhịp ôn. |
| `public/illustrations/` | Gói hình vector dùng ngoại tuyến và thông tin ghi công. |
| `scripts/generate-service-worker.mjs` | Tạo bộ nhớ ngoại tuyến và `404.html`. |
| `scripts/validate-github-pages.mjs` | Chặn phát hành khi thiếu tuyến hoặc fallback. |
| `scripts/validate-content-release.mjs` | Kiểm tra 36 tuần, 288 vị trí từ và cổng duyệt. |
| `tests/` | Kiểm tra nội dung, riêng tư, route, metadata và giao diện dựng. |

### 4. Nguyên tắc giáo dục

1. Nghe trước khi nhìn chữ trong bài nghe.
2. Dạy từ trong cụm/câu và bối cảnh; không chỉ dùng thẻ dịch hai chiều.
3. Yêu cầu trẻ chủ động gọi lại từ sau khoảng nghỉ.
4. Nói theo chu trình nghe mẫu → nhẩm → nói → ghi âm → nghe lại → tự đánh giá.
5. Đọc để tìm thông tin/ý nghĩa, không chỉ đọc thành tiếng.
6. Kết thúc tuần bằng một nhiệm vụ có mục đích giao tiếp.
7. Phản hồi cụ thể vào hành vi; không gắn nhãn “giỏi/yếu”.
8. Không chấm phát âm bằng Speech Recognition. Thiết bị, tiếng ồn và giọng vùng miền có thể làm máy nhận sai.
9. Tranh là điểm tựa để hiểu; không để trẻ chỉ gọi tên tranh mà thiếu bước nghe, tạo câu hoặc dùng trong tình huống.
10. Không thay hoạt động tạo câu bằng chép lại câu mẫu. Sau khi ghép đúng, luôn gợi ý trẻ đổi ít nhất một chi tiết theo ý mình.

Khi bổ sung nội dung, viết câu và đoạn mới; chỉ dùng CEFR, Cambridge Young Learners, Bộ GDĐT và các hướng dẫn nghiên cứu như phạm vi/phương pháp tham khảo. Không sao chép bài thi, sách hoặc đoạn văn có bản quyền.

### 5. Thích ứng và dữ liệu

- Khóa lưu: `english-raccoon-learning-v1` (giữ tên khóa để không mất hồ sơ cũ); schema hiện hành là 2 và phải tự nâng cấp schema 1.
- Dùng tối đa tám buổi gần nhất để gợi ý nhịp.
- **Gỡ nút:** điểm dưới 60 hoặc tự tin dưới 45; ít lựa chọn, nghe chậm, giữ hình, ôn sau 1 ngày.
- **Bứt phá:** điểm từ 86 và tự tin từ 75; giảm gợi ý hình, ôn sau 7 ngày.
- Còn lại: **Vừa sức**, ôn sau 3 ngày.
- Tự tin khi nói là dữ liệu tự báo cáo, không được diễn giải thành độ chuẩn phát âm.
- Khi đổi schema, phải nhập được mọi JSON cũ còn sử dụng và giữ `profileId`, lịch sử, từ đã gặp và thời điểm tạo.

### 6. Riêng tư và micro

- Chỉ xin quyền micro sau khi người dùng bấm ghi.
- Bản ghi dùng `Blob URL`, chỉ ở bộ nhớ phiên và phải giải phóng khi thay bản ghi/rời màn hình.
- Không tải âm thanh lên mạng, không lưu trong GitHub, log hoặc analytics.
- Nút Sao lưu xuất JSON; Khôi phục chỉ nhận đúng `product: English Raccoon` và schema hợp lệ.
- QR chỉ mã hóa dữ liệu vào liên kết mở trực tiếp trên thiết bị mới, không gửi hồ sơ lên máy chủ và phải yêu cầu phụ huynh xác nhận trước khi nhập.

### 7. GitHub Pages và PWA

- Giữ `output: "export"` khi `GITHUB_PAGES=true`.
- Giữ `trailingSlash: true`.
- `basePath`/`assetPrefix` lấy từ `NEXT_PUBLIC_BASE_PATH`; mặc định `/tienganhminh3`.
- Route động phải có `generateStaticParams()` và `dynamicParams = false`.
- Build phải tạo `out/404.html` và `out/sw.js`.
- Link/nút điều hướng phải tôn trọng base path.
- Không xác nhận triển khai chỉ vì build cục bộ đạt; phải kiểm tra workflow và URL thật.

### 8. Kiểm tra bắt buộc

```bash
npm ci
npm run content:validate
npm run lint
npm test
NEXT_PUBLIC_BASE_PATH=/tienganhminh3 npm run build:github
```

Điều kiện hoàn thành:

- content validation đạt;
- lint không lỗi;
- 9/9 kiểm thử hoặc nhiều hơn đều đạt;
- static export tạo tối thiểu 222 trang;
- có đủ 36 tuần, 180 bài, assessment, roadmap, parent, 404 và service worker;
- không có bí mật, hồ sơ trẻ hoặc bản ghi giọng của trẻ trong diff.

### 9. Quy trình cập nhật

1. Xác minh nhánh, commit, phiên bản và worktree.
2. Đọc README, tài liệu thiết kế, tệp nội dung và tệp liên quan yêu cầu.
3. Tách lỗi kỹ thuật, giao diện, nội dung, thích ứng và dữ liệu.
4. Thực hiện thay đổi nhỏ nhất nhưng hoàn chỉnh.
5. Thêm kiểm thử bắt lại đúng lỗi/quy tắc.
6. Chạy toàn bộ chuỗi kiểm tra.
7. Xem diff; loại tệp sinh, bí mật và dữ liệu học.
8. Tăng phiên bản dạng `YYYY.MM.DD.N` khi người dùng thấy thay đổi.
9. Chỉ đưa lên `main` khi được phép và workflow đạt.
10. Báo cáo: thay đổi, căn cứ, kiểm tra, phiên bản, URL thật và thao tác phụ huynh cần làm.

## KẾT THÚC PROMPT
