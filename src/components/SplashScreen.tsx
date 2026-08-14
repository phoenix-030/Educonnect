import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { GraduationCap } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useAuth } from "@/context/AuthContext";
import { getHomeRoute } from "@/lib/roleRoutes";

interface LoadingDotProps {
  delay: number;
}

function LoadingDot({ delay }: LoadingDotProps) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 300 }),
          withTiming(0, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false,
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, translateY]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

export function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const gradientColors = ["#2563eb", "#9333ea", "#4338ca"];

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (user) {
        router.replace(getHomeRoute(user.role));
      } else {
        router.replace("/login");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoading, user, router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        entering={FadeIn.duration(1000)}
        style={styles.contentContainer}
      >
        <View style={styles.iconContainer}>
          <GraduationCap size={96} color="#ffffff" strokeWidth={1.5} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>EduConnect</Text>
          <Text style={styles.subtitle}>College Management System</Text>
        </View>

        <View style={styles.dotsContainer}>
          <LoadingDot delay={0} />
          <LoadingDot delay={150} />
          <LoadingDot delay={300} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
});
