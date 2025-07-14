import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../../components/common/Header";
import { useAuth } from "../../context/AuthContext";

// Ảnh
import PreventionImg from "../../../assets/images/Prevention.jpg";
import Image2 from "../../../assets/images/Image2.jpg";
import Image3 from "../../../assets/images/Image3.jpg";
import SupportImg from "../../../assets/images/supporthug.jpg";
import OutdoorsImg from "../../../assets/images/outdoors.jpg";
import GroupSessionImg from "../../../assets/images/groupsession.jpg";

const screenWidth = Dimensions.get("window").width;

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    consultations: 0,
    success: 0,
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  // Debug: Log user and role in HomePage
  console.log("[HomePage] user:", user);
  console.log("[HomePage] user.role:", user?.role);

  // Counter animation
  useEffect(() => {
    const targets = {
      users: 5000,
      courses: 150,
      consultations: 2500,
      success: 95,
    };
    const duration = 2000;
    const increment = 50;
    const steps = duration / increment;
    const counters = { ...stats };

    const timer = setInterval(() => {
      let done = true;
      for (const key in targets) {
        if (counters[key] < targets[key]) {
          counters[key] = Math.min(
            counters[key] + targets[key] / steps,
            targets[key]
          );
          done = false;
        }
      }
      setStats({ ...counters });
      if (done) clearInterval(timer);
    }, increment);

    return () => clearInterval(timer);
  }, []);

  const courses = [
    {
      id: "1",
      title: "The Truth About Drugs",
      image: PreventionImg,
    },
    {
      id: "2",
      title: "The Truth About Prescription Drug Abuse",
      image: Image2,
    },
    {
      id: "3",
      title: "Recovery Pathways - Online Course",
      image: SupportImg,
    },
    {
      id: "4",
      title: "Youth Drug Prevention Toolkit",
      image: Image3,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Huấn luyện viên phục hồi",
      content:
        "SUBSTANCE đã thay đổi cách chúng ta tiếp cận việc phục hồi nghiện. Các tài nguyên rất toàn diện và thực sự thay đổi cuộc sống.",
      avatar: "👩‍⚕️",
    },
    {
      name: "Michael Chen",
      role: "Phụ huynh",
      content:
        "Các khóa học phòng ngừa đã giúp tôi hiểu cách bảo vệ con cái và hỗ trợ gia đình chúng tôi vượt qua những thời điểm khó khăn.",
      avatar: "👨‍👦",
    },
  ];

  const heroSlides = [
    {
      title: "Hỗ trợ cộng đồng",
      desc: "Tham gia cộng đồng hỗ trợ trong hành trình phục hồi",
      image: GroupSessionImg,
    },
    {
      title: "Chữa lành toàn diện",
      desc: "Khám phá các chương trình phục hồi và sức khỏe ngoài trời",
      image: OutdoorsImg,
    },
    {
      title: "Hướng dẫn chuyên môn",
      desc: "Truy cập tư vấn chuyên nghiệp và chăm sóc cá nhân",
      image: SupportImg,
    },
  ];

  const handleCoursePress = (course) => {
    // Navigate to Courses tab first, then to specific course detail
    navigation.navigate("Courses", {
      screen: "CourseList",
      params: { highlightCourse: course.id },
    });
  };

  return (
    <>
      <Header />
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Hành trình Phục hồi bắt đầu từ đây
          </Text>
          <Text style={styles.heroText}>
            Khám phá tài nguyên toàn diện và cộng đồng hỗ trợ phục hồi, phòng
            ngừa và chữa lành.
          </Text>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) =>
              setCurrentSlide(
                Math.round(e.nativeEvent.contentOffset.x / screenWidth)
              )
            }
            scrollEventThrottle={16}
          >
            {heroSlides.map((item, index) => (
              <View style={styles.carouselSlide} key={index}>
                <Image source={item.image} style={styles.carouselImage} />
                <View style={styles.carouselTextWrapper}>
                  <Text style={styles.carouselTitle}>{item.title}</Text>
                  <Text style={styles.carouselDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Số liệu ấn tượng</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{Math.floor(stats.users)}+</Text>
              <Text style={styles.statLabel}>Người dùng</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {Math.floor(stats.courses)}+
              </Text>
              <Text style={styles.statLabel}>Khóa học</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {Math.floor(stats.consultations)}+
              </Text>
              <Text style={styles.statLabel}>Buổi tư vấn</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {Math.floor(stats.success)}%
              </Text>
              <Text style={styles.statLabel}>Tỷ lệ thành công</Text>
            </View>
          </View>
        </View>

        {/* Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Khóa học nổi bật</Text>
          <FlatList
            horizontal
            data={courses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => handleCoursePress(item)}
              >
                <Image source={item.image} style={styles.cardImage} />
                <Text style={styles.cardTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Cộng đồng nói gì</Text>
          {testimonials.map((item, idx) => (
            <View key={idx} style={styles.testimonialCard}>
              <Text style={styles.testimonialAvatar}>{item.avatar}</Text>
              <Text style={styles.testimonialText}>"{item.content}"</Text>
              <Text style={styles.testimonialAuthor}>{item.name}</Text>
              <Text style={styles.testimonialRole}>{item.role}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaTextWrapper}>
            <Text style={styles.ctaTitle}>
              Sẵn sàng bắt đầu hành trình phục hồi của bạn?
            </Text>
            <Text style={styles.ctaDescription}>
              Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn trong
              mọi bước đi.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate("Booking")}
          >
            <Text style={styles.ctaButtonText}>Đặt lịch tư vấn miễn phí</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Hero
  heroSection: { padding: 20, backgroundColor: "#64b5f6" },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  heroText: { color: "#f0faff", fontSize: 14, marginBottom: 20 },
  carouselSlide: { width: screenWidth, alignItems: "center" },
  carouselImage: { width: screenWidth - 40, height: 180, borderRadius: 10 },
  carouselTextWrapper: {
    position: "absolute",
    bottom: 10,
    left: 30,
    right: 30,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 8,
  },
  carouselTitle: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  carouselDesc: { color: "#fff", fontSize: 13 },

  // Stats
  statsSection: { padding: 20, backgroundColor: "#f1f8ff" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#42a5f5" },
  statLabel: { fontSize: 13, color: "#444", marginTop: 4 },

  // Section wrapper
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },

  // Course card
  card: { marginRight: 15, width: 220 },
  cardImage: { width: "100%", height: 120, borderRadius: 10 },
  cardTitle: { fontSize: 14, marginTop: 10, fontWeight: "500" },

  // Testimonial
  testimonialCard: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  testimonialAvatar: { fontSize: 30, textAlign: "center" },
  testimonialText: {
    fontStyle: "italic",
    fontSize: 14,
    marginVertical: 10,
    textAlign: "center",
  },
  testimonialAuthor: { fontWeight: "bold", fontSize: 14, textAlign: "center" },
  testimonialRole: { fontSize: 12, color: "#666", textAlign: "center" },

  // CTA
  ctaSection: {
    backgroundColor: "#e1f5fe",
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  ctaTextWrapper: { marginBottom: 10 },
  ctaTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  ctaDescription: { fontSize: 14, color: "#555" },
  ctaButton: {
    marginTop: 10,
    backgroundColor: "#42a5f5",
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
