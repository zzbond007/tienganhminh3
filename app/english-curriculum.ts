import { orderChoiceOptions } from "./learning-integrity";

export type WordCard = {
  en: string;
  vi: string;
  icon: string;
};

export type DialogueTurn = {
  speaker: "Rory" | "Child";
  line: string;
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
  reviewWords: string[];
  soundFamily: string[];
  dialogue: DialogueTurn[];
  mission: string;
  think: {
    prompt: string;
    starter: string;
  };
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
  ["Hello, new friend!", "Gặp một người bạn mới ở sân trường.", "hello|xin chào|👋;goodbye|tạm biệt|🌤️;name|tên|🏷️;friend|bạn|🤝;boy|bé trai|👦;girl|bé gái|👧;yes|vâng/có|✅;no|không|❎", "My name is ___.", "Hello! My name is Minh. What is your name?", "h trong hello", "Ben is nine. Lan is his new friend.", "Who is Ben's new friend?", "Lan;Ben;Minh", "Lan"],
  ["Colours around us", "Săn màu trong cặp sách và lớp học.", "red|đỏ|🔴;blue|xanh dương|🔵;yellow|vàng|🟡;green|xanh lá|🟢;orange|cam|🟠;purple|tím|🟣;black|đen|⚫;white|trắng|⚪", "It is ___.", "It is a blue book.", "b trong blue", "My friend has a red pen. Her bag is green.", "What colour is the bag?", "Green;Blue;Red", "Green"],
  ["Numbers in action", "Đếm đồ vật khi chuẩn bị trò chơi.", "one|một|1️⃣;two|hai|2️⃣;three|ba|3️⃣;four|bốn|4️⃣;five|năm|5️⃣;six|sáu|6️⃣;seven|bảy|7️⃣;eight|tám|8️⃣", "I have ___ ___.", "I have three pencils.", "th trong three", "Mai has two red kites. Tom has five balls.", "How many kites does Mai have?", "Two;Five;Eight", "Two"],
  ["My family team", "Giới thiệu những người thân gần gũi.", "mother|mẹ|👩;father|bố|👨;sister|chị/em gái|👧;brother|anh/em trai|👦;grandma|bà|👵;grandpa|ông|👴;family|gia đình|👨‍👩‍👧;baby|em bé|👶", "This is my ___.", "This is my sister. Her name is An.", "th trong mother", "This is Nam's family. His baby sister is three.", "Who is three?", "His baby sister;His mother;Nam", "His baby sister"],


  ["Rooms at home", "Đi tìm đồ vật trong các phòng.", "home|nhà|🏠;bedroom|phòng ngủ|🛏️;kitchen|bếp|🍳;bathroom|phòng tắm|🛁;living room|phòng khách|🛋️;door|cửa ra vào|🚪;window|cửa sổ|🪟;garden|vườn|🌱", "Where is ___?", "Where is Dad? He is in the kitchen.", "w trong where", "Mia's family is at home. Her dad is in the kitchen. Her cat is in the garden.", "Where is the cat?", "In the garden;In the kitchen;In the bedroom", "In the garden"],
  ["Things in my room", "Sắp xếp góc học tập ngăn nắp.", "bed|giường|🛏️;desk|bàn học|🖥️;chair|ghế|🪑;lamp|đèn|💡;box|hộp|📦;toy|đồ chơi|🧸;clock|đồng hồ|🕐;picture|bức tranh|🖼️", "The ___ is on the ___.", "The lamp is on the desk.", "ch trong chair", "My bedroom is small. A lamp and a clock are on my desk. My toys are in a blue box.", "Where are the toys?", "In a blue box;On the desk;On the bed", "In a blue box"],
  ["Morning routine", "Kể lại những việc làm trước khi đến trường.", "wake up|thức dậy|⏰;wash|rửa|🧼;brush|chải|🪥;eat|ăn|🥣;drink|uống|🧃;dress|mặc đồ|👕;go|đi|➡️;morning|buổi sáng|🌅", "I ___ in the morning.", "I brush my teeth in the morning.", "br trong brush", "My clock rings at seven. I wash my face, eat breakfast and go to school.", "What does the child do after washing?", "Eat breakfast;Go to school;Wake up", "Eat breakfast"],
  ["Food I like", "Chọn món cho bữa ăn đơn giản.", "rice|cơm|🍚;bread|bánh mì|🍞;egg|trứng|🥚;chicken|thịt gà|🍗;fish|cá|🐟;apple|táo|🍎;banana|chuối|🍌;milk|sữa|🥛", "I like ___.", "I like rice and fish.", "f trong fish", "In the morning, Sam eats bread and eggs. He drinks milk but does not like bananas.", "What does Sam drink?", "Milk;Bread;Eggs", "Milk"],


  ["School subjects", "Chia sẻ môn học yêu thích.", "English|Tiếng Anh|🔤;maths|Toán|➗;art|Mỹ thuật|🎨;music|Âm nhạc|🎵;science|Khoa học|🔬;PE|Thể dục|⚽;lesson|tiết học|📖;favourite|yêu thích|🌟", "My favourite subject is ___.", "My favourite subject is English.", "s trong science", "An drinks milk at school. She likes art and music. Art is her favourite because she loves colours.", "Why is art An's favourite subject?", "She loves colours;She drinks milk;She likes music", "She loves colours"],
  ["Days of the week", "Lập lịch học và chơi trong tuần.", "Monday|thứ Hai|1️⃣;Tuesday|thứ Ba|2️⃣;Wednesday|thứ Tư|3️⃣;Thursday|thứ Năm|4️⃣;Friday|thứ Sáu|5️⃣;Saturday|thứ Bảy|6️⃣;Sunday|Chủ nhật|7️⃣;week|tuần|🗓️", "I have ___ on ___.", "I have music on Tuesday.", "w trong Wednesday", "Kim has English on Monday and art on Friday. She plays with her cousin on Sunday.", "When does Kim have art?", "Friday;Monday;Sunday", "Friday"],
  ["What can you do?", "Khám phá khả năng của mỗi người.", "run|chạy|🏃;jump|nhảy|🦘;swim|bơi|🏊;sing|hát|🎤;dance|nhảy múa|💃;draw|vẽ|✏️;ride|đi xe|🚲;play|chơi|🎲", "I can ___.", "I can swim, but I can't fly.", "sw trong swim", "On Sunday, Leo can ride a bike and swim. He cannot sing, but he loves music.", "Which two things can Leo do?", "Ride a bike and swim;Swim and sing;Ride a bike and sing", "Ride a bike and swim"],
  ["Kind classroom", "Dùng lời lịch sự để học cùng nhau.", "share|chia sẻ|🤲;wait|chờ|⏳;ask|hỏi|❓;answer|trả lời|💬;help|giúp|🫶;sorry|xin lỗi|💙;welcome|không có gì/chào mừng|🌈;kind|tử tế|🌻", "Please help me with ___.", "Please help me with this ruler. Here you go.", "k trong kind", "After a bike ride, Nora needs help. Max has a book and a ruler. He shares his ruler.", "What does Max share?", "His ruler;His book;Both items", "His ruler"],

  ["My body", "Gọi tên các bộ phận và làm theo động tác.", "head|đầu|🙂;eyes|mắt|👀;ears|tai|👂;nose|mũi|👃;mouth|miệng|👄;hands|bàn tay|👐;arms|cánh tay|💪;legs|chân|🦵", "Touch your ___.", "Touch your nose and clap your hands.", "m trong mouth", "I ask Max for help in an action game. I clap with my hands and jump with my legs.", "What do we use to clap?", "Hands;Legs;Arms", "Hands"],
  ["Feelings today", "Nhận biết và nói về cảm xúc.", "happy|vui|😊;sad|buồn|😢;angry|giận|😠;tired|mệt|😴;hungry|đói|😋;thirsty|khát|🥤;excited|háo hức|🤩;worried|lo lắng|😟", "I feel ___ because ___.", "I feel happy because I am with my friend.", "th trong thirsty", "Mai's legs feel tired after the game. She drinks water, rests and soon feels happy again.", "Why does Mai feel tired?", "She played a game;She needs water;She wants to rest", "She played a game"],
  ["Describe a friend", "Tả một người bằng lời tích cực.", "tall|cao|📏;short|thấp/ngắn|↕️;young|trẻ|🌱;funny|hài hước|😄;quiet|trầm/lặng|🤫;friendly|thân thiện|🙂;curly|xoăn|➰;straight|thẳng|➖", "My friend is ___.", "My friend is friendly and funny.", "fr trong friendly", "Lucy is a happy friend with curly hair. She is friendly and funny. She likes telling small jokes.", "What is Lucy's hair like?", "Curly;Straight;Long", "Curly"],
  ["Hobbies together", "Rủ bạn tham gia hoạt động yêu thích.", "football|bóng đá|⚽;badminton|cầu lông|🏸;chess|cờ vua|♟️;reading|đọc sách|📚;drawing|vẽ|🎨;music|âm nhạc|🎧;cooking|nấu ăn|🧑‍🍳;collecting|sưu tầm|🗂️", "Do you like ___?", "Do you like reading? Yes, I do.", "ing trong reading", "Tuan and his friendly classmate Vy have different hobbies. Tuan likes chess and reading, and Vy likes badminton. They both like music.", "What do Tuan and Vy both like?", "Music;Chess;Badminton", "Music"],

  ["Places near me", "Khám phá những nơi quen thuộc trong khu phố.", "school|trường|🏫;park|công viên|🌳;shop|cửa hàng|🏪;market|chợ|🧺;hospital|bệnh viện|🏥;library|thư viện|📚;zoo|sở thú|🦁;cinema|rạp phim|🎬", "Let's go to the ___.", "Let's go to the library.", "l trong library", "After music club, I walk past the school. The library is next to the park. The hospital is opposite the school.", "What is next to the park?", "The library;The hospital;The school", "The library"],
  ["Finding the way", "Nghe chỉ dẫn và tìm đường an toàn.", "left|trái|⬅️;right|phải|➡️;straight|thẳng|⬆️;near|gần|📍;next to|bên cạnh|↔️;opposite|đối diện|🔁;between|ở giữa|🔲;stop|dừng|🛑", "Go straight and turn ___.", "Go straight and turn left at the shop.", "str trong straight", "Go straight to the market. Turn right at the park. The library is between the park and the shop.", "Where is the library?", "Between the park and the shop;Opposite the market;Next to the school", "Between the park and the shop"],
  ["How do we travel?", "Chọn phương tiện cho một chuyến đi.", "walk|đi bộ|🚶;bike|xe đạp|🚲;bus|xe buýt|🚌;car|ô tô|🚗;train|tàu hỏa|🚆;boat|thuyền|⛵;plane|máy bay|✈️;helmet|mũ bảo hiểm|⛑️", "I go by ___.", "I go to school by bus.", "b trong bus", "Linh goes straight to school by bike and always wears a helmet. Her father can walk to work.", "What does Linh wear?", "A helmet;A coat;A hat", "A helmet"],
  ["At the shop", "Hỏi giá và lựa chọn trong một cửa hàng nhỏ.", "buy|mua|🛍️;sell|bán|🏷️;money|tiền|💵;cheap|rẻ|⬇️;expensive|đắt|⬆️;how much|bao nhiêu tiền|❓;want|muốn|🙋;change|tiền thừa|🪙", "How much is the ___?", "How much is the kite? It is five dollars.", "ch trong cheap", "Nina rides her bike to the shop. She looks at a blue kite and a green book but wants a red pencil. It is two dollars.", "What does Nina want?", "A red pencil;A blue kite;A green book", "A red pencil"],

  ["Pets at home", "Chăm sóc một người bạn nhỏ.", "cat|mèo|🐱;dog|chó|🐶;fish|cá|🐠;bird|chim|🐦;rabbit|thỏ|🐰;feed|cho ăn|🥕;water|nước|💧;gentle|nhẹ nhàng|🤍", "My ___ can ___.", "My rabbit can jump.", "g trong gentle", "I want a pet and meet Pip, a small rabbit. I feed him carrots and give him clean water.", "What does Pip eat?", "Carrots;Fish food;Bird food", "Carrots"],
  ["Wild animal clues", "Nghe đặc điểm và đoán con vật.", "elephant|voi|🐘;tiger|hổ|🐯;monkey|khỉ|🐒;giraffe|hươu cao cổ|🦒;lion|sư tử|🦁;strong|khỏe|💪;fast|nhanh|💨;long|dài|📏", "It has ___.", "It has a long neck.", "ng trong long", "Next to the rabbit is a tall animal. It has a very long neck and eats leaves.", "Which animal is it?", "A giraffe;A tiger;A monkey", "A giraffe"],
  ["Weather watch", "Quan sát trời và chọn hoạt động phù hợp.", "sunny|nắng|☀️;rainy|mưa|🌧️;cloudy|nhiều mây|☁️;windy|gió|🌬️;hot|nóng|🥵;cold|lạnh|🥶;warm|ấm|🌤️;cool|mát|🍃", "It is ___ today.", "It is windy and cool today.", "cl trong cloudy", "Long clouds cover the sky. It is rainy and cool, so we play a board game inside.", "What game do they play inside?", "A board game;A ball game;A card game", "A board game"],
  ["Outdoor explorer", "Chuẩn bị cho một chuyến khám phá thiên nhiên.", "tree|cây|🌳;flower|hoa|🌼;leaf|lá|🍃;river|sông|🏞️;mountain|núi|⛰️;stone|đá|🪨;clean|sạch|✨;protect|bảo vệ|🛡️", "I can see ___.", "I can see a river and two mountains.", "tr trong tree", "On a sunny day, we walk by a clean river. We see trees, flowers and smooth stones. We take our rubbish home.", "What do they do with their rubbish?", "Take it home;Put it in the river;Leave it by a tree", "Take it home"],

  ["Toys and games", "Giải thích cách chơi một trò đơn giản.", "kite|diều|🪁;ball|quả bóng|⚽;doll|búp bê|🪆;robot|rô-bốt|🤖;puzzle|trò ghép hình|🧩;cards|bộ bài|🃏;turn|lượt|🔄;rule|luật|📜", "It's your turn.", "Roll the ball. Now it's your turn.", "r trong rule", "We play ball near a tree, then start a card game. The rule is simple: find two cards that match.", "What must the players find?", "Two matching cards;A red ball;A big robot", "Two matching cards"],
  ["Story actions", "Sắp xếp sự việc trong một câu chuyện ngắn.", "start|bắt đầu|▶️;walk|đi bộ|🚶;see|nhìn thấy|👀;find|tìm thấy|🔎;give|đưa/tặng|🎁;take|cầm/lấy|🤲;open|mở|📖;finish|kết thúc|🏁", "First ___, then ___.", "First we walk, then we find the key.", "f trong first", "We play with cards before the story starts. First, Ava finds a box. Then she opens it and sees a silver key. At the end, she gives it to Grandma.", "What does Ava see in the box?", "A silver key;A toy;A flower", "A silver key"],
  ["Imagine a place", "Mô tả một nơi do chính mình tưởng tượng.", "castle|lâu đài|🏰;island|hòn đảo|🏝️;cave|hang|🕳️;bridge|cầu|🌉;forest|rừng|🌲;magic|kỳ diệu|✨;bright|sáng|💡;dark|tối|🌑", "There is a ___ in my world.", "There is a bright castle on the island.", "br trong bright", "We see a magic island with a dark forest and a bright castle. A small bridge crosses the river.", "What crosses the river?", "A bridge;A castle;A forest", "A bridge"],
  ["Picture detective", "Quan sát, mô tả và suy luận từ chi tiết.", "behind|phía sau|↩️;in front of|phía trước|↪️;under|bên dưới|⬇️;above|phía trên|⬆️;inside|bên trong|📥;outside|bên ngoài|📤;different|khác|🔀;same|giống|🟰", "The ___ is behind the ___.", "The cat is behind the chair.", "d trong different", "A red ball is under the table. Two same blue cups are above it. A different green cup is behind a dark book.", "Where is the red ball?", "Under the table;Behind the book;Above the cups", "Under the table"],

  ["Five senses", "Dùng giác quan để mô tả thế giới.", "see|nhìn|👀;hear|nghe|👂;smell|ngửi|👃;taste|nếm|👅;touch|chạm|🖐️;sweet|ngọt|🍯;loud|to|📢;soft|mềm|🧸", "I can ___ with my ___.", "I can hear with my ears.", "s trong smell", "Under the table, a bell sounds loud. The teddy bear is soft. The orange smells fresh and tastes sweet.", "Which thing is soft?", "The teddy bear;The bell;The orange", "The teddy bear"],
  ["Materials and making", "Chọn vật liệu để làm một đồ vật nhỏ.", "paper|giấy|📄;wood|gỗ|🪵;metal|kim loại|🔩;plastic|nhựa|🥤;glass|kính/thủy tinh|🪟;hard|cứng|🪨;light|nhẹ|🪶;heavy|nặng|🏋️", "It is made of ___.", "The box is made of wood.", "p trong paper", "We touch soft paper before making a toy boat from light wood. The window is glass, and the spoon is metal.", "What is the toy boat made of?", "Wood;Glass;Metal", "Wood"],
  ["Sky explorers", "Quan sát bầu trời ngày và đêm.", "sun|mặt trời|☀️;moon|mặt trăng|🌙;star|ngôi sao|⭐;sky|bầu trời|🌌;day|ban ngày|🌞;night|ban đêm|🌃;cloud|đám mây|☁️;shine|chiếu sáng|✨", "I can see ___ in the sky.", "I can see the moon in the night sky.", "sk trong sky", "Through the glass, we see the sun shine in the day. At night, we see the moon and stars when the sky is clear.", "When can we see many stars?", "At night;In the day;Under a cloud", "At night"],
  ["Green choices", "Thực hành những lựa chọn tốt cho môi trường.", "reuse|tái sử dụng|♻️;save|tiết kiệm|💧;turn off|tắt|🔌;rubbish|rác|🗑️;bottle|chai|🧴;bag|túi|👜;plant|trồng|🌱;earth|Trái Đất|🌍", "We can ___ to help Earth.", "We can reuse a bottle and save water.", "r trong reuse", "In the sun, our class plants a tree. We reuse paper and turn off the lights. Small choices help Earth.", "What does the class plant?", "A tree;A bottle;A light", "A tree"],

  ["Let's make a plan", "Mời bạn và thống nhất một kế hoạch.", "today|hôm nay|📅;tomorrow|ngày mai|➡️;morning|buổi sáng|🌅;afternoon|buổi chiều|🌤️;meet|gặp|🤝;bring|mang|🎒;join|tham gia|🙋;free|rảnh|🕊️", "Are you free ___?", "Are you free tomorrow afternoon?", "j trong join", "Mia puts a ball in her bag. She is free tomorrow morning and asks Ben to meet at the park. Ben will bring a bottle.", "What will Ben bring?", "A bottle;A ball;A bag", "A bottle"],
  ["Solve it together", "Dùng tiếng Anh để giải quyết một vấn đề nhỏ.", "problem|vấn đề|🧩;idea|ý tưởng|💡;try|thử|🛠️;again|lại lần nữa|🔁;because|bởi vì|🧠;maybe|có lẽ|🤔;agree|đồng ý|🤝;better|tốt hơn|⬆️", "Maybe we can ___.", "Maybe we can try again.", "tr trong try", "Ben can bring paper, but the bridge falls. Linh has an idea: use more paper. Max agrees because the bridge may be stronger.", "Why does Max agree?", "The bridge may be stronger;Linh has an idea;The first bridge falls", "The bridge may be stronger"],
  ["Show and tell", "Nói ngắn gọn về một đồ vật có ý nghĩa.", "special|đặc biệt|🌟;old|cũ/già|🕰️;new|mới|✨;from|từ|📍;gift|món quà|🎁;keep|giữ|🤲;remember|nhớ|💭;story|câu chuyện|📖", "This is special because ___.", "This book is special because it is a gift from Grandma.", "sp trong special", "I have an idea for show and tell. This old car is special because it was a gift from Grandpa. I keep it in a blue box.", "Why is the car special?", "It was a gift;It is old;It is in a blue box", "It was a gift"],
  ["Final adventure", "Hoàn thành hành trình bằng một cuộc hội thoại tổng hợp.", "listen|nghe|👂;speak|nói|🗣️;read|đọc|📚;remember|nhớ|🧠;question|câu hỏi|❓;answer|câu trả lời|💬;brave|dũng cảm|🦁;proud|tự hào|🏅", "I can ___ in English.", "I can listen, speak and read in English.", "pr trong proud", "Rory can remember a special story from his English journey. He listens, asks a question and gives a clear answer. He feels proud because he kept trying.", "Why does Rory feel proud?", "He kept trying;He gives a clear answer;He finishes the journey", "He kept trying"],
];

type WeekEnrichment = {
  reviewWords: string[];
  soundFamily: string[];
  mission: string;
  think: { prompt: string; starter: string };
};

const rawEnrichment: Array<[string, string, string, string, string]> = [
  ["", "hello;home;help", "Tìm một người trong nhà, nhìn vào mắt người đó và nói: Hello! My name is ___. Nice to meet you.", "Con sẽ chủ động chào ai hôm nay?", "Hello, ___!"],
  ["friend", "blue;black;book", "Săn ba đồ vật khác màu quanh con. Chỉ vào từng vật và nói: It is ___ .", "Màu nào xuất hiện nhiều nhất quanh con?", "I can see ___ things."],
  ["red", "three;thumb;think", "Lấy 1–8 đồ vật nhỏ, giấu bớt một nhóm rồi để người thân nghe câu I have ___ ___ và đoán số lượng.", "Con muốn có bao nhiêu món cho trò chơi của mình?", "I want ___ ___."],
  ["three", "mother;father;brother", "Chọn một ảnh gia đình, giới thiệu hai người bằng This is my ___ và thêm tên của họ.", "Điều gì làm gia đình con thành một đội?", "My family can ___."],

  ["family", "where;window;welcome", "Giấu một đồ chơi trong một phòng. Hỏi Where is ___? để người thân tìm bằng tiếng Anh.", "Phòng nào thích hợp để đọc sách nhất? Vì sao?", "The ___ is good for reading because ___."],
  ["bedroom", "chair;child;chess", "Đổi vị trí ba đồ vật trên bàn rồi mô tả bằng on hoặc in; người thân làm theo lời con.", "Con sẽ đặt món đồ ở đâu để dễ tìm?", "The ___ is on/in the ___."],
  ["clock", "brush;brown;bread", "Diễn ba việc buổi sáng không nói tiếng Việt; vừa làm vừa kể I ___ in the morning.", "Việc nào giúp con sẵn sàng nhanh hơn?", "I ___ first."],
  ["morning", "fish;food;four", "Thiết kế một đĩa ăn tưởng tượng có ba món; nói hai món con thích và một món con không chọn.", "Bữa ăn cân bằng của con có những gì?", "I choose ___ and ___."],

  ["milk", "science;sun;six", "Tạo thời khóa biểu mini cho một ngày và giải thích môn con chọn bằng My favourite subject is ___ because ___.", "Môn nào giúp con tạo ra thứ mới? Vì sao?", "I choose ___ because ___."],
  ["art", "Wednesday;week;windy", "Hỏi một người thân về lịch tuần, rồi báo lại một hoạt động bằng I have ___ on ___.", "Ngày nào con bận nhất?", "On ___, I ___."],
  ["Sunday", "swim;sweet;swing", "Tạo thử thách ba động tác. Con nói I can ___, làm mẫu, rồi mời người thân thử.", "Kỹ năng nào con muốn luyện tiếp?", "I want to learn to ___."],
  ["ride", "kind;kite;kitchen", "Đóng vai đang thiếu một đồ dùng học tập: nói Please help me with ___, nhận đồ và nói Thank you.", "Nếu bạn chưa giúp được, con có thể nói gì để vẫn tử tế?", "That's OK. I can ___."],

  ["help", "mouth;mother;milk", "Chơi Touch and move: người thân đọc lệnh, con chạm đúng bộ phận; sau ba lượt hãy đổi vai và tăng tốc.", "Bộ phận nào giúp con giữ thăng bằng?", "My ___ help me balance."],
  ["legs", "thirsty;three;think", "Chọn một cảm xúc thật hôm nay, chỉ dấu hiệu trên khuôn mặt và nói I feel ___ because ___.", "Con có thể làm gì khi thấy lo lắng?", "I can ___ when I feel worried."],
  ["happy", "friendly;friend;fresh", "Nghĩ về một người bạn và nói hai điều tích cực; hỏi người nghe đoán con đang tả ai.", "Lời miêu tả nào có thể làm bạn vui?", "My friend is ___ and ___."],
  ["friendly", "reading;drawing;cooking", "Mời người thân cùng làm một sở thích bằng Do you like ___? Nếu khác ý, tìm một hoạt động cả hai cùng thích.", "Sở thích nào hai người có thể cùng làm?", "We can ___ together."],

  ["music", "library;lamp;left", "Chọn một nơi cả nhà có thể đến cuối tuần, nêu lựa chọn và một lý do.", "Nơi nào hữu ích nhất cho khu phố? Vì sao?", "The ___ is useful because ___."],
  ["park;library", "straight;street;strong", "Đặt cốc giữa hai đồ vật rồi chỉ đường cho người thân tìm cốc; dùng straight, left/right và between/next to.", "Có hai đường đi, con chọn đường nào an toàn hơn?", "Go ___ because ___."],
  ["straight", "bus;bike;boat", "So sánh hai cách đến một nơi gần nhà, chọn phương tiện phù hợp và nhắc một điều an toàn.", "Phương tiện nào phù hợp quãng đường ngắn? Vì sao?", "I choose ___ because ___."],
  ["bike", "cheap;change;chair", "Dán giá giả lên ba đồ vật, đóng vai người mua–người bán, hỏi giá và tính tiền thừa bằng đồ chơi.", "Nếu không đủ tiền, con có thể chọn cách nào?", "I can choose the ___ one."],

  ["want", "gentle;giant;giraffe", "Dùng thú bông làm thú cưng; trình bày hai việc con cần làm mỗi ngày để chăm sóc nó.", "Thú cưng cần gì mỗi ngày?", "It needs ___ and ___."],
  ["rabbit", "long;strong;sing", "Không nói tên con vật; đưa ba manh mối về kích thước, tốc độ hoặc bộ phận để người thân đoán.", "Đặc điểm nào giúp đoán con vật nhanh nhất?", "The best clue is ___."],
  ["long", "cloudy;clean;clap", "Đứng cạnh cửa sổ làm người dẫn bản tin: nói thời tiết, chọn quần áo và hoạt động phù hợp.", "Thời tiết nào phù hợp chơi ngoài trời?", "When it is ___, I can ___."],
  ["sunny", "tree;train;try", "Khám phá ngoài trời năm phút, gọi tên ba thứ nhìn thấy và chọn một hành động để bảo vệ nơi đó.", "Một hành động nào bảo vệ nơi con khám phá?", "We can ___ to protect it."],

  ["tree", "rule;robot;red", "Dạy người thân một trò đơn giản: nêu lượt chơi, một luật và kiểm tra xem người nghe đã hiểu chưa.", "Luật nào làm trò chơi công bằng?", "The rule is ___."],
  ["cards", "first;find;finish", "Chọn ba đồ vật làm nhân vật; kể chuyện có First, Then và At the end, sau đó đổi đoạn kết.", "Nếu đổi sự việc đầu tiên, đoạn kết có thể ra sao?", "Maybe the story ends with ___."],
  ["see", "bright;bridge;brown", "Vẽ một hòn đảo tưởng tượng, đặt ba địa điểm và mô tả vị trí để người thân vẽ lại không nhìn tranh.", "Nơi tưởng tượng của con an toàn nhờ điều gì?", "It is safe because ___."],
  ["dark", "different;desk;door", "Giấu một đồ vật trong cảnh có ba vật mốc; chỉ mô tả vị trí để người thân đóng vai thám tử.", "Chi tiết nào giúp tìm đồ vật nhanh nhất?", "Look ___ the ___."],

  ["under", "smell;see;soft", "Cho ba vật an toàn vào túi kín; không nhìn, dùng chạm/nghe/ngửi để đoán và giải thích dấu hiệu.", "Giác quan nào không nên dùng với một vật lạ? Vì sao?", "I should not ___ because ___."],
  ["soft", "paper;plastic;pen", "Làm một vật nhỏ bằng giấy hoặc bìa; nói vật liệu, đặc tính và vì sao con chọn nó.", "Vật liệu nào phù hợp để làm thuyền? Vì sao?", "I choose ___ because it is ___."],
  ["glass", "sky;school;skip", "Quan sát bầu trời hai thời điểm hoặc hai ảnh; nói một điểm giống và một điểm khác.", "Bầu trời ban ngày và ban đêm khác nhau thế nào?", "In the day ___, but at night ___."],
  ["sun", "reuse;rubbish;red", "Đi tuần xanh quanh nhà, chọn hai việc có thể làm ngay và giải thích việc nào quan trọng hơn.", "Lựa chọn xanh nào con làm được hôm nay?", "Today I can ___."],

  ["bag", "join;juice;jump", "Lập cuộc hẹn giả với người thân: thống nhất thời gian, nơi gặp và mỗi người cần mang gì.", "Một kế hoạch tốt cần nhớ những gì?", "We need a time, a place and ___."],
  ["bring", "try;tree;train", "Làm cầu giấy, thử một vật nhẹ, rồi đề xuất một thay đổi bằng Maybe we can ___ because ___.", "Một lần thử chưa thành công cho con biết điều gì?", "We can try ___ next."],
  ["idea", "special;speak;spoon", "Chọn một đồ vật có ý nghĩa, nói trong 30 giây: nó từ đâu, vì sao đặc biệt và con giữ ở đâu.", "Vì sao một đồ vật cũ vẫn có thể đặc biệt?", "It is special because ___."],
  ["remember", "proud;protect;present", "Tổ chức phần trình bày 60 giây: giới thiệu, kể một điều đã học, hỏi–đáp và kết thúc bằng điều con tự hào.", "Kỹ năng tiếng Anh nào làm con tự hào nhất? Bằng chứng là gì?", "I am proud because I can ___."],
];

const rawDialogues: Array<[string, string, string, string]> = [
  ["Hello! My name is Rory. What is your name?", "Hello! My name is Minh.", "Nice to meet you, Minh.", "Nice to meet you too."],
  ["What colour is your bag?", "It is blue.", "Can you find something red?", "Yes. This pencil is red."],
  ["How many pencils do you have?", "I have three pencils.", "Can I have one pencil, please?", "Yes. Here you are."],
  ["Who is in this photo?", "This is my sister. Her name is An.", "What can you do together?", "We can draw together."],

  ["Where is Dad?", "He is in the kitchen.", "And where is the cat?", "It is in the garden."],
  ["Where is your lamp?", "The lamp is on my desk.", "What is in the box?", "My toys are in the box."],
  ["What do you do first in the morning?", "I brush my teeth first.", "What do you do next?", "I eat breakfast and go to school."],
  ["What do you like for breakfast?", "I like bread and eggs.", "Would you like some milk?", "Yes, please. Thank you."],

  ["What is your favourite subject?", "My favourite subject is English.", "Why do you like it?", "Because I can speak with new friends."],
  ["When do you have music?", "I have music on Tuesday.", "What do you do on Sunday?", "I play with my cousin on Sunday."],
  ["What can you do well?", "I can swim and ride a bike.", "Can you sing?", "Not yet, but I can practise."],
  ["Please help me with this ruler.", "Here you go.", "Thank you for sharing.", "You're welcome."],

  ["Touch your nose and clap your hands.", "Like this?", "Yes! Now jump with your legs.", "I can do it."],
  ["How do you feel today?", "I feel happy because I am with my friend.", "What can you do if you feel worried?", "I can breathe slowly and ask for help."],
  ["Tell me about your friend.", "My friend is friendly and funny.", "What does your friend like?", "My friend likes drawing."],
  ["Do you like reading?", "Yes, I do.", "What can we do together?", "We can read a funny story."],

  ["Where would you like to go?", "Let's go to the library.", "Why the library?", "Because we can find new stories there."],
  ["How do I get to the library?", "Go straight and turn left at the shop.", "Is it next to the park?", "Yes, it is between the park and the shop."],
  ["How do you go to school?", "I go to school by bus.", "What keeps you safe on a bike?", "A helmet keeps me safe."],
  ["Hello. How much is the kite?", "It is five dollars.", "I only have three dollars.", "You can choose the cheaper ball."],

  ["What pet do you have?", "I have a rabbit.", "What can your rabbit do?", "It can jump, and I feed it carrots."],
  ["It has a long neck. What is it?", "Is it a giraffe?", "Yes! Why do you think so?", "Because a giraffe has a long neck."],
  ["What is the weather like today?", "It is windy and cool today.", "What should we do?", "Let's play inside and wear warm clothes."],
  ["What can you see by the river?", "I can see trees, flowers and smooth stones.", "How can we protect this place?", "We can take our rubbish home."],

  ["It's your turn. What is the rule?", "I roll the ball to you.", "What happens next?", "You roll it back. That keeps the game fair."],
  ["What happens first in your story?", "First, we walk into the forest.", "What happens next?", "Then we find a key and open a box."],
  ["What is in your magic world?", "There is a bright castle on an island.", "How do we reach it?", "We cross a bridge over the river."],
  ["Where is the cat?", "The cat is behind the chair.", "Is the ball in the same place?", "No. The ball is under the table."],

  ["What can you hear?", "I can hear a loud bell.", "What does the teddy bear feel like?", "It feels soft when I touch it."],
  ["What is your boat made of?", "It is made of paper.", "Why did you choose paper?", "Because it is light and easy to fold."],
  ["What can you see in the night sky?", "I can see the moon and stars.", "What shines in the day?", "The sun shines in the day."],
  ["How can we help Earth today?", "We can reuse a bottle and save water.", "What else can we do?", "We can turn off the lights."],

  ["Are you free tomorrow afternoon?", "Yes, I am. Where shall we meet?", "Let's meet at the park.", "Great. I will bring a ball."],
  ["Our paper bridge falls. What can we do?", "Maybe we can try again.", "What should we change?", "We can use more paper because it may be stronger."],
  ["What is special to you?", "This book is special because it is a gift from Grandma.", "Where do you keep it?", "I keep it in a blue box."],
  ["What can you do in English now?", "I can listen, speak and read in English.", "What makes you feel proud?", "I feel proud because I kept trying."],
];

if (rawEnrichment.length !== rawWeeks.length) {
  throw new Error(`Curriculum enrichment mismatch: ${rawEnrichment.length}/${rawWeeks.length} weeks.`);
}
if (rawDialogues.length !== rawWeeks.length) {
  throw new Error(`Curriculum dialogue mismatch: ${rawDialogues.length}/${rawWeeks.length} weeks.`);
}

const enrichments: WeekEnrichment[] = rawEnrichment.map(([review, sounds, mission, prompt, starter]) => ({
  reviewWords: review ? review.split(";") : [],
  soundFamily: sounds.split(";"),
  mission,
  think: { prompt, starter },
}));

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
  reviewWords: enrichments[index].reviewWords,
  soundFamily: enrichments[index].soundFamily,
  dialogue: rawDialogues[index].map((line, turnIndex) => ({ speaker: turnIndex % 2 === 0 ? "Rory" : "Child", line })),
  mission: enrichments[index].mission,
  think: enrichments[index].think,
  check: {
    question: row[7],
    options: orderChoiceOptions(row[8].split(";"), row[9], index + 1),
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
  { key: "speak", title: "Nói cùng Rory", subtitle: "Nghe – đáp lời – ghi âm", icon: "🎙️" },
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
