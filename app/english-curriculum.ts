export type WordCard = {
  en: string;
  vi: string;
  icon: string;
};

export type WeekPlan = {
  week: number;
  world: number;
  title: string;
  scene: string;
  words: WordCard[];
  frame: string;
  model: string;
  sound: string;
  passage: string;
  check: {
    question: string;
    options: string[];
    answer: string;
  };
};

const rawWeeks: Array<[
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
]> = [
  ["Hello, new friend!", "Gặp một người bạn mới ở sân trường.", "hello|xin chào|👋;goodbye|tạm biệt|🌤️;name|tên|🏷️;friend|bạn|🤝;boy|bé trai|👦;girl|bé gái|👧;yes|vâng/có|✅;no|không|❎", "My name is ___.", "Hello! My name is Minh. What is your name?", "h trong hello", "Hello! My name is Ben. I am nine. Lan is my new friend.", "Who is Ben's new friend?", "Lan;Minh;A teacher", "Lan"],
  ["Colours around us", "Săn màu trong cặp sách và lớp học.", "red|đỏ|🔴;blue|xanh dương|🔵;yellow|vàng|🟡;green|xanh lá|🟢;orange|cam|🟠;purple|tím|🟣;black|đen|⚫;white|trắng|⚪", "It is ___.", "It is a blue book.", "b trong blue", "I have a red pen and a blue book. My bag is green.", "What colour is the bag?", "Green;Blue;Red", "Green"],
  ["Numbers in action", "Đếm đồ vật khi chuẩn bị trò chơi.", "one|một|1️⃣;two|hai|2️⃣;three|ba|3️⃣;four|bốn|4️⃣;five|năm|5️⃣;six|sáu|6️⃣;seven|bảy|7️⃣;eight|tám|8️⃣", "I have ___ ___.", "I have three pencils.", "th trong three", "Mai has two kites. Tom has five balls. They count the toys together.", "How many kites does Mai have?", "Two;Five;Eight", "Two"],
  ["My family team", "Giới thiệu những người thân gần gũi.", "mother|mẹ|👩;father|bố|👨;sister|chị/em gái|👧;brother|anh/em trai|👦;grandma|bà|👵;grandpa|ông|👴;family|gia đình|👨‍👩‍👧;baby|em bé|👶", "This is my ___.", "This is my sister. Her name is An.", "th trong mother", "This is Nam's family. His mother is a doctor. His baby sister likes music.", "Who likes music?", "His baby sister;His mother;Nam's teacher", "His baby sister"],


  ["Rooms at home", "Đi tìm đồ vật trong các phòng.", "home|nhà|🏠;bedroom|phòng ngủ|🛏️;kitchen|bếp|🍳;bathroom|phòng tắm|🛁;living room|phòng khách|🛋️;door|cửa ra vào|🚪;window|cửa sổ|🪟;garden|vườn|🌱", "Where is ___?", "Where is Dad? He is in the kitchen.", "w trong where", "Mia is at home. Her dad is in the kitchen. Her cat is in the garden.", "Where is the cat?", "In the garden;In the kitchen;In the bedroom", "In the garden"],
  ["Things in my room", "Sắp xếp góc học tập ngăn nắp.", "bed|giường|🛏️;desk|bàn học|🗄️;chair|ghế|🪑;lamp|đèn|💡;box|hộp|📦;toy|đồ chơi|🧸;clock|đồng hồ|🕐;picture|bức tranh|🖼️", "The ___ is on the ___.", "The lamp is on the desk.", "ch trong chair", "My room is small. A lamp and a clock are on my desk. My toys are in a blue box.", "Where are the toys?", "In a blue box;On the bed;Under the lamp", "In a blue box"],
  ["Morning routine", "Kể lại những việc làm trước khi đến trường.", "wake up|thức dậy|⏰;wash|rửa|🧼;brush|chải|🪥;eat|ăn|🥣;drink|uống|🥛;dress|mặc đồ|👕;go|đi|🚶;morning|buổi sáng|🌅", "I ___ in the morning.", "I brush my teeth in the morning.", "br trong brush", "I wake up at seven. I wash my face, eat breakfast and go to school.", "What does the child do after washing?", "Eat breakfast;Go to bed;Play football", "Eat breakfast"],
  ["Food I like", "Chọn món cho bữa ăn đơn giản.", "rice|cơm|🍚;bread|bánh mì|🍞;egg|trứng|🥚;chicken|thịt gà|🍗;fish|cá|🐟;apple|táo|🍎;banana|chuối|🍌;milk|sữa|🥛", "I like ___.", "I like rice and fish.", "f trong fish", "Sam likes bread and eggs. He drinks milk. He does not like bananas.", "What does Sam drink?", "Milk;Juice;Water", "Milk"],


  ["School subjects", "Chia sẻ môn học yêu thích.", "English|Tiếng Anh|🔤;maths|Toán|➗;art|Mỹ thuật|🎨;music|Âm nhạc|🎵;science|Khoa học|🔬;PE|Thể dục|⚽;lesson|tiết học|📖;favourite|yêu thích|🌟", "My favourite subject is ___.", "My favourite subject is English.", "s trong science", "An likes art and music. Her favourite subject is art because she loves colours.", "Why does An like art?", "She loves colours;She likes numbers;She can run", "She loves colours"],
  ["Days of the week", "Lập lịch học và chơi trong tuần.", "Monday|thứ Hai|1️⃣;Tuesday|thứ Ba|2️⃣;Wednesday|thứ Tư|3️⃣;Thursday|thứ Năm|4️⃣;Friday|thứ Sáu|5️⃣;Saturday|thứ Bảy|6️⃣;Sunday|Chủ nhật|7️⃣;week|tuần|🗓️", "I have ___ on ___.", "I have music on Tuesday.", "w trong Wednesday", "Kim has English on Monday and art on Friday. She plays with her cousin on Sunday.", "When does Kim have art?", "Friday;Monday;Sunday", "Friday"],
  ["What can you do?", "Khám phá khả năng của mỗi người.", "run|chạy|🏃;jump|nhảy|🦘;swim|bơi|🏊;sing|hát|🎤;dance|nhảy múa|💃;draw|vẽ|✏️;ride|đi xe|🚲;play|chơi|🎲", "I can ___.", "I can swim, but I can't fly.", "sw trong swim", "Leo can ride a bike and swim. He cannot sing, but he loves music.", "What can Leo do?", "Ride a bike;Fly;Sing", "Ride a bike"],
  ["Kind classroom", "Dùng lời lịch sự để học cùng nhau.", "share|chia sẻ|🤲;wait|chờ|⏳;ask|hỏi|❓;answer|trả lời|💬;help|giúp|🫶;sorry|xin lỗi|💙;welcome|không có gì/chào mừng|🌈;kind|tử tế|🌻", "Could you help me, please?", "Could you help me, please? Yes, of course.", "k trong kind", "Nora cannot find her ruler. She asks Max for help. Max shares his ruler with her.", "What does Max share?", "His ruler;His book;His lunch", "His ruler"],

  ["My body", "Gọi tên các bộ phận và làm theo động tác.", "head|đầu|🙂;eyes|mắt|👀;ears|tai|👂;nose|mũi|👃;mouth|miệng|👄;hands|bàn tay|👐;arms|cánh tay|💪;legs|chân|🦵", "Touch your ___.", "Touch your nose and clap your hands.", "m trong mouth", "I have two eyes, two ears and one nose. I clap with my hands and jump with my legs.", "What do we use to clap?", "Hands;Eyes;Ears", "Hands"],
  ["Feelings today", "Nhận biết và nói về cảm xúc.", "happy|vui|😊;sad|buồn|😢;angry|giận|😠;tired|mệt|😴;hungry|đói|😋;thirsty|khát|🥤;excited|háo hức|🤩;worried|lo lắng|😟", "I feel ___ because ___.", "I feel happy because I am with my friend.", "th trong thirsty", "Mai feels tired after the game. She drinks water and rests. Soon she feels happy again.", "Why does Mai feel tired?", "She played a game;She is hungry;She read a book", "She played a game"],
  ["Describe a friend", "Tả một người bằng lời tích cực.", "tall|cao|📏;short|thấp/ngắn|↕️;young|trẻ|🌱;funny|hài hước|😄;quiet|trầm/lặng|🤫;friendly|thân thiện|🙂;curly|xoăn|➰;straight|thẳng|➖", "My friend is ___.", "My friend is friendly and funny.", "fr trong friendly", "My friend Lucy has curly hair. She is friendly and funny. She likes telling small jokes.", "What is Lucy's hair like?", "Curly;Straight;Short and blue", "Curly"],
  ["Hobbies together", "Rủ bạn tham gia hoạt động yêu thích.", "football|bóng đá|⚽;badminton|cầu lông|🏸;chess|cờ vua|♟️;reading|đọc sách|📚;drawing|vẽ|🎨;music|âm nhạc|🎧;cooking|nấu ăn|🧑‍🍳;collecting|sưu tầm|🗂️", "Do you like ___?", "Do you like reading? Yes, I do.", "ing trong reading", "Tuan likes chess and reading. His friend Vy likes badminton. They both like music.", "What do Tuan and Vy both like?", "Music;Chess;Badminton", "Music"],

  ["Places near me", "Khám phá những nơi quen thuộc trong khu phố.", "school|trường|🏫;park|công viên|🌳;shop|cửa hàng|🏪;market|chợ|🧺;hospital|bệnh viện|🏥;library|thư viện|📚;zoo|sở thú|🦁;cinema|rạp phim|🎬", "Let's go to the ___.", "Let's go to the library.", "l trong library", "There is a park near my school. The library is next to the park. I read there on Saturday.", "What is next to the park?", "The library;The hospital;The zoo", "The library"],
  ["Finding the way", "Nghe chỉ dẫn và tìm đường an toàn.", "left|trái|⬅️;right|phải|➡️;straight|thẳng|⬆️;near|gần|📍;next to|bên cạnh|↔️;opposite|đối diện|🔁;between|ở giữa|↔️;stop|dừng|🛑", "Go straight and turn ___.", "Go straight and turn left at the shop.", "str trong straight", "Go straight to the market. Turn right. The park is next to the library.", "Where is the park?", "Next to the library;Opposite the market;Behind the school", "Next to the library"],
  ["How do we travel?", "Chọn phương tiện cho một chuyến đi.", "walk|đi bộ|🚶;bike|xe đạp|🚲;bus|xe buýt|🚌;car|ô tô|🚗;train|tàu hỏa|🚆;boat|thuyền|⛵;plane|máy bay|✈️;helmet|mũ bảo hiểm|⛑️", "I go by ___.", "I go to school by bus.", "b trong bus", "Linh goes to school by bike. She always wears a helmet. Her father walks to work.", "What does Linh wear?", "A helmet;A coat;A hat", "A helmet"],
  ["At the shop", "Hỏi giá và lựa chọn trong một cửa hàng nhỏ.", "buy|mua|🛍️;sell|bán|🏷️;money|tiền|💵;cheap|rẻ|⬇️;expensive|đắt|⬆️;how much|bao nhiêu tiền|❓;want|muốn|🙋;change|tiền thừa|🪙", "How much is the ___?", "How much is the kite? It is five dollars.", "ch trong cheap", "Nina wants a red pencil. It is two dollars. She gives the shopkeeper five dollars.", "What does Nina want?", "A red pencil;A blue kite;A green book", "A red pencil"],

  ["Pets at home", "Chăm sóc một người bạn nhỏ.", "cat|mèo|🐱;dog|chó|🐶;fish|cá|🐠;bird|chim|🐦;rabbit|thỏ|🐰;feed|cho ăn|🥕;water|nước|💧;gentle|nhẹ nhàng|🤍", "My ___ can ___.", "My rabbit can jump.", "g trong gentle", "Pip is a small rabbit. He can jump and run. I feed him carrots and give him clean water.", "What does Pip eat?", "Carrots;Fish;Bread", "Carrots"],
  ["Wild animal clues", "Nghe đặc điểm và đoán con vật.", "elephant|voi|🐘;tiger|hổ|🐯;monkey|khỉ|🐒;giraffe|hươu cao cổ|🦒;lion|sư tử|🦁;strong|khỏe|💪;fast|nhanh|💨;long|dài|📏", "It has ___.", "It has a long neck.", "ng trong long", "This animal is tall. It has a very long neck and four long legs. It eats leaves.", "Which animal is it?", "A giraffe;A tiger;A monkey", "A giraffe"],
  ["Weather watch", "Quan sát trời và chọn hoạt động phù hợp.", "sunny|nắng|☀️;rainy|mưa|🌧️;cloudy|nhiều mây|☁️;windy|gió|🌬️;hot|nóng|🥵;cold|lạnh|🥶;warm|ấm|🌤️;cool|mát|🍃", "It is ___ today.", "It is windy and cool today.", "cl trong cloudy", "It is rainy and cool today. We take our coats and play a board game inside.", "Why do they play inside?", "It is rainy;It is sunny;It is bedtime", "It is rainy"],
  ["Outdoor explorer", "Chuẩn bị cho một chuyến khám phá thiên nhiên.", "tree|cây|🌳;flower|hoa|🌼;leaf|lá|🍃;river|sông|🏞️;mountain|núi|⛰️;stone|đá|🪨;clean|sạch|✨;protect|bảo vệ|🛡️", "I can see ___.", "I can see a river and two mountains.", "tr trong tree", "We walk by a clean river. We see green trees, yellow flowers and smooth stones. We take our rubbish home.", "What do they do with their rubbish?", "Take it home;Put it in the river;Leave it by a tree", "Take it home"],

  ["Toys and games", "Giải thích cách chơi một trò đơn giản.", "kite|diều|🪁;ball|quả bóng|⚽;doll|búp bê|🪆;robot|rô-bốt|🤖;puzzle|trò ghép hình|🧩;cards|bộ bài|🃏;turn|lượt|🔄;rule|luật|📜", "It's your turn.", "Roll the ball. Now it's your turn.", "r trong rule", "We play a card game. Mia goes first, then Ben. The rule is simple: find two cards that match.", "What must the players find?", "Two matching cards;A red ball;A big robot", "Two matching cards"],
  ["Story actions", "Sắp xếp sự việc trong một câu chuyện ngắn.", "start|bắt đầu|▶️;walk|đi bộ|🚶;see|nhìn thấy|👀;find|tìm thấy|🔎;give|đưa/tặng|🎁;take|cầm/lấy|🤲;open|mở|📖;finish|kết thúc|🏁", "First ___, then ___.", "First we walk, then we find the key.", "f trong first", "First, Ava finds a little box. Then she opens it and sees a silver key. At the end, she gives the key to her grandma.", "What does Ava see in the box?", "A silver key;A toy;A flower", "A silver key"],
  ["Imagine a place", "Mô tả một nơi do chính mình tưởng tượng.", "castle|lâu đài|🏰;island|hòn đảo|🏝️;cave|hang|🕳️;bridge|cầu|🌉;forest|rừng|🌲;magic|kỳ diệu|✨;bright|sáng|💡;dark|tối|🌑", "There is a ___ in my world.", "There is a bright castle on the island.", "br trong bright", "On the magic island, there is a dark forest and a bright castle. A small bridge crosses the river.", "What crosses the river?", "A bridge;A castle;A forest", "A bridge"],
  ["Picture detective", "Quan sát, mô tả và suy luận từ chi tiết.", "behind|phía sau|↩️;in front of|phía trước|↪️;under|bên dưới|⬇️;above|phía trên|⬆️;inside|bên trong|📥;outside|bên ngoài|📤;different|khác|🔀;same|giống|🟰", "The ___ is behind the ___.", "The cat is behind the chair.", "d trong different", "A red ball is under the table. Two same blue cups are above it. A different green cup is behind the book.", "Where is the red ball?", "Under the table;Behind the book;Above the cups", "Under the table"],

  ["Five senses", "Dùng giác quan để mô tả thế giới.", "see|nhìn|👀;hear|nghe|👂;smell|ngửi|👃;taste|nếm|👅;touch|chạm|🖐️;sweet|ngọt|🍯;loud|to|📢;soft|mềm|🧸", "I can ___ with my ___.", "I can hear with my ears.", "s trong smell", "The bell is loud. The teddy bear is soft. The orange smells fresh and tastes sweet.", "Which thing is soft?", "The teddy bear;The bell;The orange", "The teddy bear"],
  ["Materials and making", "Chọn vật liệu để làm một đồ vật nhỏ.", "paper|giấy|📄;wood|gỗ|🪵;metal|kim loại|🔩;plastic|nhựa|🥤;glass|kính/thủy tinh|🪟;hard|cứng|🪨;light|nhẹ|🪶;heavy|nặng|🏋️", "It is made of ___.", "The box is made of wood.", "p trong paper", "Our toy boat is made of light wood. The window is made of glass. The spoon is metal.", "What is the toy boat made of?", "Wood;Glass;Metal", "Wood"],
  ["Sky explorers", "Quan sát bầu trời ngày và đêm.", "sun|mặt trời|☀️;moon|mặt trăng|🌙;star|ngôi sao|⭐;sky|bầu trời|🌌;day|ban ngày|🌞;night|ban đêm|🌃;cloud|đám mây|☁️;shine|chiếu sáng|✨", "I can see ___ in the sky.", "I can see the moon in the night sky.", "sk trong sky", "The sun shines in the day. At night, we can see the moon and many stars when the sky is clear.", "When can we see many stars?", "At night;At lunch;On Monday only", "At night"],
  ["Green choices", "Thực hành những lựa chọn tốt cho môi trường.", "reuse|tái sử dụng|♻️;save|tiết kiệm|💧;turn off|tắt|🔌;rubbish|rác|🗑️;bottle|chai|🧴;bag|túi|👜;plant|trồng|🌱;earth|Trái Đất|🌍", "We can ___ to help Earth.", "We can reuse a bottle and save water.", "r trong reuse", "Our class plants a tree. We reuse paper and turn off the lights. Small choices help Earth.", "What does the class plant?", "A tree;A bottle;A light", "A tree"],

  ["Let's make a plan", "Mời bạn và thống nhất một kế hoạch.", "today|hôm nay|📅;tomorrow|ngày mai|➡️;morning|buổi sáng|🌅;afternoon|buổi chiều|🌤️;meet|gặp|🤝;bring|mang|🎒;join|tham gia|🙋;free|rảnh|🕊️", "Are you free ___?", "Are you free tomorrow afternoon?", "j trong join", "Mia is free tomorrow morning. She asks Ben to meet at the park. Ben will bring a ball.", "What will Ben bring?", "A ball;A book;A bike", "A ball"],
  ["Solve it together", "Dùng tiếng Anh để giải quyết một vấn đề nhỏ.", "problem|vấn đề|🧩;idea|ý tưởng|💡;try|thử|🛠️;again|lại lần nữa|🔁;because|bởi vì|🧠;maybe|có lẽ|🤔;agree|đồng ý|🤝;better|tốt hơn|⬆️", "Maybe we can ___.", "Maybe we can try again.", "tr trong try", "The paper bridge falls. Linh has an idea: use more paper. Max agrees because the bridge will be stronger.", "Why does Max agree?", "The bridge may be stronger;He wants a red pen;It is lunchtime", "The bridge may be stronger"],
  ["Show and tell", "Nói ngắn gọn về một đồ vật có ý nghĩa.", "special|đặc biệt|🌟;old|cũ/già|🕰️;new|mới|✨;from|từ|📍;gift|món quà|🎁;keep|giữ|🤲;remember|nhớ|💭;story|câu chuyện|📖", "This is special because ___.", "This book is special because it is a gift from Grandma.", "sp trong special", "This little car is old, but it is special. It was a gift from my grandpa. I keep it in a blue box.", "Why is the car special?", "It was a gift;It is expensive;It is very big", "It was a gift"],
  ["Final adventure", "Hoàn thành hành trình bằng một cuộc hội thoại tổng hợp.", "listen|nghe|👂;speak|nói|🗣️;read|đọc|📚;remember|nhớ|🧠;question|câu hỏi|❓;answer|câu trả lời|💬;brave|dũng cảm|🦁;proud|tự hào|🏅", "I can ___ in English.", "I can listen, speak and read in English.", "pr trong proud", "Rory finishes the English journey. He listens carefully, asks a question and gives a clear answer. He feels proud because he kept trying.", "Why does Rory feel proud?", "He kept trying;He found money;He flew a plane", "He kept trying"],
];

function parseWords(value: string): WordCard[] {
  return value.split(";").map((item) => {
    const [en, vi, icon] = item.split("|");
    return { en, vi, icon };
  });
}

export const weeks: WeekPlan[] = rawWeeks.map((row, index) => ({
  week: index + 1,
  world: Math.floor(index / 4) + 1,
  title: row[0],
  scene: row[1],
  words: parseWords(row[2]),
  frame: row[3],
  model: row[4],
  sound: row[5],
  passage: row[6],
  check: {
    question: row[7],
    options: row[8].split(";"),
    answer: row[9],
  },
}));

export const worlds = [
  { title: "Hello World", subtitle: "Bản thân, lớp học và gia đình", color: "#ef5b5b" },
  { title: "Cosy Home", subtitle: "Nhà ở, thói quen và đồ ăn", color: "#f39b3d" },
  { title: "School Quest", subtitle: "Học tập, lịch tuần và hợp tác", color: "#d5a719" },
  { title: "Heart & Friends", subtitle: "Cơ thể, cảm xúc và sở thích", color: "#45a66f" },
  { title: "Around Town", subtitle: "Địa điểm, chỉ đường và mua sắm", color: "#1aa5a5" },
  { title: "Wild & Wonderful", subtitle: "Động vật, thời tiết và thiên nhiên", color: "#397dc6" },
  { title: "Story Studio", subtitle: "Trò chơi, kể chuyện và tưởng tượng", color: "#7258c7" },
  { title: "Little Explorer", subtitle: "Giác quan, vật liệu và môi trường", color: "#9b58bd" },
  { title: "Brave Speaker", subtitle: "Lập kế hoạch, giải quyết và trình bày", color: "#d24f91" },
];

export const sessionKinds = [
  { key: "listen", title: "Tai thính", subtitle: "Nghe và nhận ra", icon: "🎧" },
  { key: "speak", title: "Nói cùng Rory", subtitle: "Bắt chước và ghi âm", icon: "🎙️" },
  { key: "read", title: "Mắt tinh", subtitle: "Đọc và hiểu ý", icon: "📖" },
  { key: "recall", title: "Kho từ nhớ lâu", subtitle: "Nhớ lại không nhìn", icon: "🧠" },
  { key: "mission", title: "Nhiệm vụ giao tiếp", subtitle: "Dùng tiếng Anh thật", icon: "🗣️" },
] as const;

export const programFacts = {
  weeks: 36,
  sessions: 180,
  coreWords: 288,
  minutes: "15–20",
  target: "Pre‑A1 vững · tiếp cận A1",
};

export function lessonToWeek(lesson: number) {
  return Math.min(36, Math.max(1, Math.ceil(lesson / 5)));
}

export function lessonToSession(lesson: number) {
  return Math.min(4, Math.max(0, (lesson - 1) % 5));
}
