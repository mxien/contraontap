import { Question, Subject } from '../types/game';

export const SUBJECTS: Subject[] = [
  {
    id: 'hoa_hoc',
    name: 'Hóa Học',
    icon: '🧪',
    color: '#06b6d4',
    description: 'Bảng tuần hoàn, phản ứng hóa học, kim loại & phi kim'
  },
  {
    id: 'sinh_hoc',
    name: 'Sinh Học',
    icon: '🧬',
    color: '#10b981',
    description: 'Tế bào, di truyền học, sinh thái và tiến hóa'
  },
  {
    id: 'dia_ly',
    name: 'Địa Lý',
    icon: '🌍',
    color: '#f59e0b',
    description: 'Địa hình Việt Nam & thế giới, khí hậu, các châu lục'
  },
  {
    id: 'lich_su',
    name: 'Lịch Sử',
    icon: '⚔️',
    color: '#ef4444',
    description: 'Lịch sử hào hùng Việt Nam và các mốc son thế giới'
  },
  {
    id: 'vat_ly',
    name: 'Vật Lý',
    icon: '⚡',
    color: '#8b5cf6',
    description: 'Cơ học, điện học, quang học và chuyển động'
  },
  {
    id: 'toan_hoc',
    name: 'Toán Học',
    icon: '📐',
    color: '#3b82f6',
    description: 'Đại số, hình học, xác suất và tư duy logic'
  },
  {
    id: 'tieng_anh',
    name: 'Tiếng Anh',
    icon: '📚',
    color: '#ec4899',
    description: 'Từ vựng, ngữ pháp, thành ngữ giao tiếp chuẩn'
  }
];

export const DEFAULT_QUESTIONS: Question[] = [
  // --- HÓA HỌC ---
  {
    id: 'chem-1',
    subjectId: 'hoa_hoc',
    question: 'Khí nào chiếm thể tích lớn nhất trong bầu khí quyển Trái Đất (khoảng 78%)?',
    options: ['Khí Oxy (O2)', 'Khí Nitơ (N2)', 'Khí Cacbonic (CO2)', 'Khí Argon (Ar)'],
    correctIndex: 1,
    hint: 'Khí này là thành phần chính giúp bảo vệ bề mặt trái đất khỏi cháy nổ tự do do oxy và có kí hiệu hóa học N.',
    difficulty: 'easy'
  },
  {
    id: 'chem-2',
    subjectId: 'hoa_hoc',
    question: 'Kim loại nào ở trạng thái lỏng ở điều kiện nhiệt độ phòng tiêu chuẩn?',
    options: ['Vàng (Au)', 'Thủy ngân (Hg)', 'Chì (Pb)', 'Nhôm (Al)'],
    correctIndex: 1,
    hint: 'Kim loại này thường được dùng trong nhiệt kế truyền thống đo nhiệt độ cơ thể.',
    difficulty: 'easy'
  },
  {
    id: 'chem-3',
    subjectId: 'hoa_hoc',
    question: 'Nước vôi trong phản ứng với khí nào làm xuất hiện kết tủa trắng vẩn đục?',
    options: ['Khí Hidro (H2)', 'Khí Cacbon đioxit (CO2)', 'Khí Metan (CH4)', 'Khí Ozon (O3)'],
    correctIndex: 1,
    hint: 'Khí sinh ra từ quá trình hô hấp của con người và quá trình đốt cháy than đá, xăng dầu.',
    difficulty: 'medium'
  },
  {
    id: 'chem-4',
    subjectId: 'hoa_hoc',
    question: 'Axit nào có công thức phân tử là H2SO4 và được mệnh danh là "máu của ngành công nghiệp"?',
    options: ['Axit Clohidric', 'Axit Nitric', 'Axit Sunfuric', 'Axit Axetic'],
    correctIndex: 2,
    hint: 'Chứa nguyên tố lưu huỳnh (S), dùng nhiều trong sản xuất ắc quy, phân bón.',
    difficulty: 'medium'
  },
  {
    id: 'chem-5',
    subjectId: 'hoa_hoc',
    question: 'Kim loại có tính dẫn điện tốt nhất trong tất cả các kim loại là:',
    options: ['Đồng (Cu)', 'Bạc (Ag)', 'Vàng (Au)', 'Nhôm (Al)'],
    correctIndex: 1,
    hint: 'Mặc dù đồng phổ biến làm dây điện vì giá thành rẻ, kim loại quý màu trắng ánh kim này mới có độ dẫn điện số 1.',
    difficulty: 'hard'
  },

  // --- SINH HỌC ---
  {
    id: 'bio-1',
    subjectId: 'sinh_hoc',
    question: 'Bào quan nào được ví như "nhà máy sản xuất năng lượng" (ATP) của tế bào?',
    options: ['Lưới nội chất', 'Ti thể (Mitochondria)', 'Bộ máy Golgi', 'Ribosome'],
    correctIndex: 1,
    hint: 'Bào quan có màng kép, màng trong gấp nếp chứa các enzyme chu trình hô hấp tế bào.',
    difficulty: 'easy'
  },
  {
    id: 'bio-2',
    subjectId: 'sinh_hoc',
    question: 'Sắc tố nào đóng vai trò chính hấp thụ năng lượng ánh sáng trong quá trình quang hợp ở thực vật?',
    options: ['Carotenoid', 'Diệp lục (Clorophin)', 'Anthocyanin', 'Melanin'],
    correctIndex: 1,
    hint: 'Sắc tố này tạo nên màu xanh lục đặc trưng cho lá cây.',
    difficulty: 'easy'
  },
  {
    id: 'bio-3',
    subjectId: 'sinh_hoc',
    question: 'Ở người bình thường, bộ nhiễm sắc thể lưỡng bội (2n) gồm bao nhiêu chiếc?',
    options: ['23 chiếc', '46 chiếc', '48 chiếc', '44 chiếc'],
    correctIndex: 1,
    hint: 'Gồm 22 cặp nhiễm sắc thể thường và 1 cặp nhiễm sắc thể giới tính (tổng cộng 23 cặp).',
    difficulty: 'medium'
  },
  {
    id: 'bio-4',
    subjectId: 'sinh_hoc',
    question: 'Nhóm máu nào được gọi là "nhóm máu chuyên cho" trong hệ thống nhóm máu ABO?',
    options: ['Nhóm máu A', 'Nhóm máu B', 'Nhóm máu AB', 'Nhóm máu O'],
    correctIndex: 3,
    hint: 'Hồng cầu của nhóm máu này không chứa kháng nguyên A hay kháng nguyên B trên bề mặt.',
    difficulty: 'medium'
  },
  {
    id: 'bio-5',
    subjectId: 'sinh_hoc',
    question: 'Ai là người phát hiện ra các quy luật di truyền cơ bản thông qua thí nghiệm lai đậu Hà Lan?',
    options: ['Charles Darwin', 'Gregor Mendel', 'Louis Pasteur', 'James Watson'],
    correctIndex: 1,
    hint: 'Ông là một tu sĩ kiêm nhà khoa học người Áo, được suy tôn là cha đẻ của ngành di truyền học.',
    difficulty: 'hard'
  },

  // --- ĐỊA LÝ ---
  {
    id: 'geo-1',
    subjectId: 'dia_ly',
    question: 'Đỉnh núi nào được mệnh danh là "nóc nhà Đông Dương" với độ cao 3.143 mét?',
    options: ['Đỉnh Ngọc Linh', 'Đỉnh Fansipan', 'Đỉnh Bạch Mộc Lương Tử', 'Đỉnh Tây Côn Lĩnh'],
    correctIndex: 1,
    hint: 'Nằm trên dãy núi Hoàng Liên Sơn, thuộc tỉnh Lào Cai.',
    difficulty: 'easy'
  },
  {
    id: 'geo-2',
    subjectId: 'dia_ly',
    question: 'Đại dương nào có diện tích và độ sâu lớn nhất trên hành tinh Trái Đất?',
    options: ['Đại Tây Dương', 'Ấn Độ Dương', 'Thái Bình Dương', 'Bắc Băng Dương'],
    correctIndex: 2,
    hint: 'Bao phủ hơn 30% bề mặt trái đất và chứa rãnh Mariana sâu hơn 11.000 mét.',
    difficulty: 'easy'
  },
  {
    id: 'geo-3',
    subjectId: 'dia_ly',
    question: 'Dòng sông nào dài nhất thế giới chảy qua khu vực Đông Bắc châu Phi?',
    options: ['Sông Amazon', 'Sông Nile (Nin)', 'Sông Dương Tử', 'Sông Mê Kông'],
    correctIndex: 1,
    hint: 'Con sông huyền thoại gắn liền với nền văn minh Ai Cập cổ đại xây dựng Kim tự tháp.',
    difficulty: 'medium'
  },
  {
    id: 'geo-4',
    subjectId: 'dia_ly',
    question: 'Việt Nam nằm trọn vẹn trong vùng đới khí hậu nào sau đây?',
    options: ['Ôn đới hải dương', 'Nhiệt đới gió mùa', 'Hàn đới lục địa', 'Cận nhiệt đới khô'],
    correctIndex: 1,
    hint: 'Đặc trưng bởi nhiệt độ cao quanh năm, độ ẩm lớn và hai mùa gió chính (gió mùa mùa hạ và mùa đông).',
    difficulty: 'medium'
  },
  {
    id: 'geo-5',
    subjectId: 'dia_ly',
    question: 'Quốc gia nào có diện tích lãnh thổ đất liền lớn nhất thế giới?',
    options: ['Canada', 'Hoa Kỳ', 'Nga (Liên bang Nga)', 'Trung Quốc'],
    correctIndex: 2,
    hint: 'Trải dài trên cả hai châu lục Á và Âu với hơn 17 triệu km2 diện tích.',
    difficulty: 'hard'
  },

  // --- LỊCH SỬ ---
  {
    id: 'his-1',
    subjectId: 'lich_su',
    question: 'Chiến thắng lịch sử Điện Biên Phủ "lừng lẫy năm châu, chấn động địa cầu" diễn ra vào năm nào?',
    options: ['Năm 1945', 'Năm 1954', 'Năm 1972', 'Năm 1975'],
    correctIndex: 1,
    hint: 'Diễn ra sau 56 ngày đêm khoét núi ngủ hầm, kết thúc vào ngày 7 tháng 5 của năm này.',
    difficulty: 'easy'
  },
  {
    id: 'his-2',
    subjectId: 'lich_su',
    question: 'Vị vua nào đã ban "Chiếu dời đô" chuyển kinh đô từ Hoa Lư về Thăng Long năm 1010?',
    options: ['Lý Công Uẩn (Lý Thái Tổ)', 'Lê Hoàn', 'Đinh Bộ Lĩnh', 'Trần Hưng Đạo'],
    correctIndex: 0,
    hint: 'Ông là người sáng lập ra triều đại nhà Lý hưng thịnh.',
    difficulty: 'easy'
  },
  {
    id: 'his-3',
    subjectId: 'lich_su',
    question: 'Chiến thắng Bạch Đằng năm 938 do ai lãnh đạo đã chấm dứt hơn 1000 năm Bắc thuộc?',
    options: ['Trần Quốc Tuấn', 'Ngô Quyền', 'Lê Lợi', 'Quang Trung'],
    correctIndex: 1,
    hint: 'Vị tướng đã sáng tạo ra kế sách đóng cọc gỗ bịt sắt vát nhọn dưới lòng sông Bạch Đằng.',
    difficulty: 'medium'
  },
  {
    id: 'his-4',
    subjectId: 'lich_su',
    question: 'Tổ chức Liên Hợp Quốc (UN) chính thức được thành lập sau khi kết thúc sự kiện lịch sử nào?',
    options: ['Chiến tranh thế giới thứ nhất', 'Chiến tranh thế giới thứ hai', 'Chiến tranh Lạnh', 'Cách mạng tháng Mười Nga'],
    correctIndex: 1,
    hint: 'Sau năm 1945 khi khối Đồng minh đánh bại chủ nghĩa phát xít.',
    difficulty: 'medium'
  },
  {
    id: 'his-5',
    subjectId: 'lich_su',
    question: 'Bản "Tuyên ngôn Độc lập" khai sinh ra nước Việt Nam Dân chủ Cộng hòa được đọc vào ngày nào?',
    options: ['19/08/1945', '02/09/1945', '30/04/1975', '03/02/1930'],
    correctIndex: 1,
    hint: 'Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn tại Quảng trường Ba Đình lịch sử, nay là ngày Quốc khánh.',
    difficulty: 'hard'
  },

  // --- VẬT LÝ ---
  {
    id: 'phy-1',
    subjectId: 'vat_ly',
    question: 'Đơn vị đo lường của cường độ dòng điện trong hệ đo lường quốc tế (SI) là gì?',
    options: ['Vôn (V)', 'Ampe (A)', 'Ohm (Ω)', 'Watt (W)'],
    correctIndex: 1,
    hint: 'Kí hiệu bằng chữ cái A, đặt theo tên nhà vật lý người Pháp André-Marie Ampère.',
    difficulty: 'easy'
  },
  {
    id: 'phy-2',
    subjectId: 'vat_ly',
    question: 'Trong chân không, vận tốc truyền của ánh sáng xấp xỉ bằng bao nhiêu?',
    options: ['300.000 km/s', '3.000 km/s', '30.000 km/h', '150.000 km/s'],
    correctIndex: 0,
    hint: 'Tương đương khoảng 3 x 10^8 m/s, vận tốc nhanh nhất có thể đạt được trong vũ trụ.',
    difficulty: 'easy'
  },
  {
    id: 'phy-3',
    subjectId: 'vat_ly',
    question: 'Định luật vạn vật hấp dẫn nổi tiếng được nhà khoa học nào tìm ra?',
    options: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'],
    correctIndex: 1,
    hint: 'Giai thoại nổi tiếng về quả táo rơi trúng đầu khi ông đang ngồi suy ngẫm dưới gốc cây.',
    difficulty: 'medium'
  },
  {
    id: 'phy-4',
    subjectId: 'vat_ly',
    question: 'Hiện tượng ánh sáng bị đổi hướng khi truyền từ môi trường trong suốt này sang môi trường trong suốt khác gọi là:',
    options: ['Hiện tượng phản xạ', 'Hiện tượng khúc xạ ánh sáng', 'Hiện tượng giao thoa', 'Hiện tượng quang điện'],
    correctIndex: 1,
    hint: 'Lý do khiến chúng ta nhìn một chiếc đũa cắm vào cốc nước trông như bị gãy khúc tại mặt phân cách.',
    difficulty: 'medium'
  },
  {
    id: 'phy-5',
    subjectId: 'vat_ly',
    question: 'Công thức biểu diễn Định luật II Newton về mối liên hệ giữa Lực (F), Khối lượng (m) và Gia tốc (a) là:',
    options: ['F = m / a', 'F = m . a', 'F = a / m', 'F = m + a'],
    correctIndex: 1,
    hint: 'Lực tác dụng lên một vật bằng tích của khối lượng vật đó và gia tốc mà vật thu được.',
    difficulty: 'hard'
  },

  // --- TOÁN HỌC ---
  {
    id: 'math-1',
    subjectId: 'toan_hoc',
    question: 'Số nguyên tố chẵn duy nhất trong tập hợp các số tự nhiên là số nào?',
    options: ['0', '2', '4', '6'],
    correctIndex: 1,
    hint: 'Là số tự nhiên lớn hơn 1 và chỉ chia hết cho 1 và chính nó, đồng thời chia hết cho 2.',
    difficulty: 'easy'
  },
  {
    id: 'math-2',
    subjectId: 'toan_hoc',
    question: 'Tổng ba góc trong một tam giác phẳng bất kỳ luôn luôn bằng bao nhiêu độ?',
    options: ['90 độ', '180 độ', '270 độ', '360 độ'],
    correctIndex: 1,
    hint: 'Tương đương số độ của một góc bẹt (nửa đường tròn).',
    difficulty: 'easy'
  },
  {
    id: 'math-3',
    subjectId: 'toan_hoc',
    question: 'Trong tam giác vuông có hai cạnh góc vuông dài 3 cm và 4 cm, cạnh huyền có độ dài là:',
    options: ['5 cm', '6 cm', '7 cm', '25 cm'],
    correctIndex: 0,
    hint: 'Áp dụng định lý Pythagoras: Bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông (3^2 + 4^2 = 9 + 16 = 25).',
    difficulty: 'medium'
  },
  {
    id: 'math-4',
    subjectId: 'toan_hoc',
    question: 'Nghiệm của phương trình bậc nhất 2x - 10 = 0 là:',
    options: ['x = 2', 'x = 5', 'x = 10', 'x = -5'],
    correctIndex: 1,
    hint: 'Chuyển -10 sang vế phải thành 10, sau đó chia cả hai vế cho 2.',
    difficulty: 'medium'
  },
  {
    id: 'math-5',
    subjectId: 'toan_hoc',
    question: 'Số Pi (π) biểu thị tỉ số giữa đại lượng nào của hình tròn?',
    options: ['Chu vi chia cho Bán kính', 'Chu vi chia cho Đường kính', 'Diện tích chia cho Chu vi', 'Đường kính chia cho Bán kính'],
    correctIndex: 1,
    hint: 'C = π . d => π = C / d.',
    difficulty: 'hard'
  },

  // --- TIẾNG ANH ---
  {
    id: 'eng-1',
    subjectId: 'tieng_anh',
    question: 'Từ nào sau đây là dạng quá khứ phân từ (V3) bất quy tắc của động từ "GO"?',
    options: ['Went', 'Gone', 'Going', 'Goes'],
    correctIndex: 1,
    hint: 'Cột 1 là Go, cột 2 (quá khứ đơn) là Went, cột 3 là từ này.',
    difficulty: 'easy'
  },
  {
    id: 'eng-2',
    subjectId: 'tieng_anh',
    question: 'Chọn từ đồng nghĩa thích hợp nhất với tính từ "FAST" (nhanh chóng):',
    options: ['Slow', 'Quick', 'Careful', 'Quiet'],
    correctIndex: 1,
    hint: 'Bắt đầu bằng chữ Q, diễn tả tốc độ nhanh gọn.',
    difficulty: 'easy'
  },
  {
    id: 'eng-3',
    subjectId: 'tieng_anh',
    question: 'Điền từ còn thiếu vào câu điều kiện loại 1: "If it rains tomorrow, we _____ stay at home."',
    options: ['would', 'will', 'had', 'have'],
    correctIndex: 1,
    hint: 'Mệnh đề chính của câu điều kiện loại 1 dùng thì tương lai đơn với trợ động từ Will.',
    difficulty: 'medium'
  },
  {
    id: 'eng-4',
    subjectId: 'tieng_anh',
    question: 'Thành ngữ tiếng Anh "Piece of cake" có nghĩa tương đương trong tiếng Việt là:',
    options: ['Một miếng bánh ngọt', 'Dễ như ăn cháo / Rất dễ dàng', 'Một công việc vất vả', 'Bữa tiệc sinh nhật'],
    correctIndex: 1,
    hint: 'Dùng khi muốn nói một thử thách hay nhiệm vụ nào đó quá đơn giản để vượt qua.',
    difficulty: 'medium'
  },
  {
    id: 'eng-5',
    subjectId: 'tieng_anh',
    question: 'Chọn danh từ không đếm được (Uncountable Noun) trong các từ dưới đây:',
    options: ['Book', 'Apple', 'Water', 'Car'],
    correctIndex: 2,
    hint: 'Chất lỏng trong suốt không có hình dạng cố định, không thể đếm từng cái 1, 2, 3 mà phải dùng đơn vị lít, chai, cốc.',
    difficulty: 'hard'
  }
];
