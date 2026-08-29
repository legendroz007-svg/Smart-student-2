import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
  background: "#F4FBF6",
  card: "#FFFFFF",
  primary: "#16A34A",
  primaryDark: "#15803D",
  text: "#122018",
  muted: "#6B7A70",
  border: "#DDEBE1",
  lightGreen: "#DCFCE7",
  danger: "#DC2626",
};

const STORAGE_KEY = "SMART_STUDENT_DATA";

export default function App() {
  const [tab, setTab] = useState("Home");
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState({
    name: "Student",
    xp: 0,
    streak: 0,
  });
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tasks,
          profile,
          studyMinutes,
        })
      );
    }
  }, [tasks, profile, studyMinutes, loading]);

  async function loadData() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        const data = JSON.parse(saved);

        setTasks(data.tasks || []);
        setProfile(
          data.profile || {
            name: "Student",
            xp: 0,
            streak: 0,
          }
        );
        setStudyMinutes(data.studyMinutes || 0);
      }
    } catch (error) {
      console.log("Loading error:", error);
    }

    setLoading(false);
  }

  function addTask(task) {
    setTasks((old) => [
      ...old,
      {
        ...task,
        id: Date.now().toString(),
        completed: false,
      },
    ]);
  }

  function completeTask(id) {
    setTasks((old) =>
      old.map((task) => {
        if (task.id === id && !task.completed) {
          setProfile((p) => ({
            ...p,
            xp: p.xp + 50,
          }));

          return {
            ...task,
            completed: true,
          };
        }

        return task;
      })
    );
  }

  function deleteTask(id) {
    Alert.alert(
      "Delete task?",
      "This task will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setTasks((old) =>
              old.filter((task) => task.id !== id)
            );
          },
        },
      ]
    );
  }

  function addStudyTime(minutes) {
    setStudyMinutes((old) => old + minutes);

    setProfile((p) => ({
      ...p,
      xp: p.xp + minutes * 2,
    }));
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.loadingText}>
          Loading Smart Student...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        {tab === "Home" && (
          <Home
            profile={profile}
            tasks={tasks}
            studyMinutes={studyMinutes}
            goTasks={() => setTab("Tasks")}
            goStudy={() => setTab("Study")}
          />
        )}

        {tab === "Tasks" && (
          <Tasks
            tasks={tasks}
            addTask={addTask}
            completeTask={completeTask}
            deleteTask={deleteTask}
          />
        )}

        {tab === "Timetable" && <Timetable />}

        {tab === "Study" && (
          <Study
            addStudyTime={addStudyTime}
            totalMinutes={studyMinutes}
          />
        )}

        {tab === "Profile" && (
          <Profile
            profile={profile}
            setProfile={setProfile}
            studyMinutes={studyMinutes}
            completedTasks={
              tasks.filter((t) => t.completed).length
            }
          />
        )}
      </View>

      <BottomNav tab={tab} setTab={setTab} />
    </SafeAreaView>
  );
}

/* ---------------- HOME ---------------- */

function Home({
  profile,
  tasks,
  studyMinutes,
  goTasks,
  goStudy,
}) {
  const pending = tasks.filter((t) => !t.completed).length;

  const motivational =
    profile.xp >= 500
      ? "You're doing amazing! Keep it going 🚀"
      : "Every small study session counts.";

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>
        Hey, {profile.name} 👋
      </Text>

      <Text style={styles.date}>
        {new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </Text>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Keep going! 🔥
        </Text>

        <Text style={styles.heroText}>
          {motivational}
        </Text>

        <Text style={styles.heroStreak}>
          🔥 {profile.streak} day streak
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Today's Progress
      </Text>

      <View style={styles.statsRow}>
        <Stat number={pending} label="Tasks" />
        <Stat
          number={`${Math.floor(studyMinutes / 60)}h ${
            studyMinutes % 60
          }m`}
          label="Study"
        />
        <Stat
          number={`${profile.xp} XP`}
          label="XP"
        />
      </View>

      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={styles.greenButton}
          onPress={goTasks}
        >
          <Text style={styles.greenButtonText}>
            + Add Task
          </Text>
        </Pressable>

        <Pressable
          style={styles.greenButton}
          onPress={goStudy}
        >
          <Text style={styles.greenButtonText}>
            ▶ Study
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>
        Pending Homework
      </Text>

      {tasks.filter((t) => !t.completed).length === 0 ? (
        <Empty text="No pending homework 🎉" />
      ) : (
        tasks
          .filter((t) => !t.completed)
          .slice(0, 3)
          .map((task) => (
            <View style={styles.card} key={task.id}>
              <Text style={styles.cardTitle}>
                {task.title}
              </Text>

              <Text style={styles.cardText}>
                {task.subject} • Due {task.dueDate}
              </Text>
            </View>
          ))
      )}
    </ScrollView>
  );
}

/* ---------------- TASKS ---------------- */

function Tasks({
  tasks,
  addTask,
  completeTask,
  deleteTask,
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] =
    useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] =
    useState("Medium");

  function saveTask() {
    if (!title.trim()) {
      Alert.alert(
        "Missing title",
        "Please enter homework title."
      );
      return;
    }

    if (!subject.trim()) {
      Alert.alert(
        "Missing subject",
        "Please enter a subject."
      );
      return;
    }

    addTask({
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      dueDate: dueDate.trim() || "No date",
      priority,
    });

    setTitle("");
    setSubject("");
    setDescription("");
    setDueDate("");
    setPriority("Medium");
    setAdding(false);
  }

  if (adding) {
    return (
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>
          Add Homework
        </Text>

        <Input
          label="Homework"
          placeholder="e.g. Maths exercise 1–10"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Subject"
          placeholder="e.g. Mathematics"
          value={subject}
          onChangeText={setSubject}
        />

        <Input
          label="Description"
          placeholder="Optional description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Input
          label="Due date"
          placeholder="e.g. 30 August"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <Text style={styles.inputLabel}>
          Priority
        </Text>

        <View style={styles.priorityRow}>
          {["Low", "Medium", "High"].map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.priorityButton,
                priority === p &&
                  styles.selectedPriority,
              ]}
            >
              <Text
                style={
                  priority === p
                    ? styles.selectedPriorityText
                    : styles.priorityText
                }
              >
                {p}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={saveTask}
        >
          <Text style={styles.primaryButtonText}>
            Add Homework
          </Text>
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={() => setAdding(false)}
        >
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
    >
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>
          Tasks
        </Text>

        <Pressable
          style={styles.smallAdd}
          onPress={() => setAdding(true)}
        >
          <Text style={styles.smallAddText}>
            + Add
          </Text>
        </Pressable>
      </View>

      {tasks.length === 0 ? (
        <Empty text="No homework yet 📚" />
      ) : (
        tasks.map((task) => (
          <View
            style={[
              styles.card,
              task.completed &&
                styles.completedCard,
            ]}
            key={task.id}
          >
            <View style={styles.taskTop}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.cardTitle,
                    task.completed &&
                      styles.completedText,
                  ]}
                >
                  {task.title}
                </Text>

                <Text style={styles.cardText}>
                  {task.subject}
                </Text>

                <Text style={styles.cardText}>
                  Due: {task.dueDate}
                </Text>

                <Text style={styles.priorityLabel}>
                  {task.priority} Priority
                </Text>
              </View>
            </View>

            {!task.completed ? (
              <Pressable
                style={styles.completeButton}
                onPress={() =>
                  completeTask(task.id)
                }
              >
                <Text style={styles.completeText}>
                  ✓ Complete
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.doneText}>
                ✓ Completed +50 XP
              </Text>
            )}

            <Pressable
              onPress={() => deleteTask(task.id)}
            >
              <Text style={styles.deleteText}>
                Delete
              </Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

/* ---------------- STUDY ---------------- */

function Study({
  addStudyTime,
  totalMinutes,
}) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessionMinutes, setSessionMinutes] =
    useState(25);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSeconds((old) => {
        if (old <= 1) {
          clearInterval(timer);
          setRunning(false);
          addStudyTime(sessionMinutes);

          Alert.alert(
            "Session complete! 🎉",
            `You studied for ${sessionMinutes} minutes.`
          );

          return 25 * 60;
        }

        return old - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  function resetTimer() {
    setRunning(false);
    setSeconds(sessionMinutes * 60);
  }

  function changeDuration(minutes) {
    if (running) return;

    setSessionMinutes(minutes);
    setSeconds(minutes * 60);
  }

  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const secs = (seconds % 60)
    .toString()
    .padStart(2, "0");

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>
        Study
      </Text>

      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>
          Focus Mode
        </Text>

        <Text style={styles.timer}>
          {mins}:{secs}
        </Text>

        <View style={styles.durationRow}>
          {[15, 25, 45].map((m) => (
            <Pressable
              key={m}
              style={[
                styles.durationButton,
                sessionMinutes === m &&
                  styles.durationSelected,
              ]}
              onPress={() => changeDuration(m)}
            >
              <Text
                style={
                  sessionMinutes === m
                    ? styles.durationSelectedText
                    : styles.durationText
                }
              >
                {m}m
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.startButton}
          onPress={() => setRunning(!running)}
        >
          <Text style={styles.startText}>
            {running ? "Pause" : "Start Studying"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.resetButton}
          onPress={resetTimer}
        >
          <Text style={styles.resetText}>
            Reset
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>
        Study Statistics
      </Text>

      <View style={styles.statsRow}>
        <Stat
          number={`${Math.floor(
            totalMinutes / 60
          )}h`}
          label="Total"
        />

        <Stat
          number={`${totalMinutes}m`}
          label="Minutes"
        />
      </View>
    </ScrollView>
  );
}

/* ---------------- TIMETABLE ---------------- */

function Timetable() {
  const schedule = [
    ["08:00", "Mathematics"],
    ["09:00", "Science"],
    ["10:00", "English"],
    ["11:00", "Computer"],
    ["12:00", "History"],
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>
        Timetable
      </Text>

      {schedule.map(([time, subject]) => (
        <View style={styles.schedule} key={time}>
          <Text style={styles.time}>
            {time}
          </Text>

          <View>
            <Text style={styles.cardTitle}>
              {subject}
            </Text>

            <Text style={styles.cardText}>
              Room 204
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/* ---------------- PROFILE ---------------- */

function Profile({
  profile,
  setProfile,
  studyMinutes,
  completedTasks,
}) {
  const level =
    Math.floor(profile.xp / 500) + 1;

  const progress =
    (profile.xp % 500) / 5;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>
        Profile
      </Text>

      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.name
              ? profile.name[0].toUpperCase()
              : "S"}
          </Text>
        </View>

        <TextInput
          style={styles.nameInput}
          value={profile.name}
          onChangeText={(name) =>
            setProfile((p) => ({
              ...p,
              name,
            }))
          }
          placeholder="Your name"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Level {level} ⭐
        </Text>

        <Text style={styles.cardText}>
          {profile.xp} XP
        </Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progress,
              { width: `${progress}%` },
            ]}
          />
        </View>

        <Text style={styles.progressText}>
          {500 - (profile.xp % 500)} XP to next level
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Achievements 🏆
        </Text>

        <Text style={styles.cardText}>
          🔥 {profile.streak} Day Streak{"\n"}
          ✅ {completedTasks} Tasks Completed{"\n"}
          📚 {Math.floor(studyMinutes / 60)} Hours Studied
        </Text>
      </View>
    </ScrollView>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Input({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
}) {
  return (
    <View>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#9AA69E"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
      />
    </View>
  );
}

function Stat({ number, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNumber}>
        {number}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function Empty({ text }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>
        {text}
      </Text>
    </View>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    ["Home", "⌂"],
    ["Tasks", "✓"],
    ["Timetable", "▣"],
    ["Study", "▶"],
    ["Profile", "●"],
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map(([name, icon]) => (
        <Pressable
          key={name}
          style={styles.navItem}
          onPress={() => setTab(name)}
        >
          <Text
            style={[
              styles.navIcon,
              tab === name && styles.activeNav,
            ]}
          >
            {icon}
          </Text>

          <Text
            style={[
              styles.navText,
              tab === name && styles.activeNav,
            ]}
          >
            {name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  loadingText: {
    color: COLORS.primaryDark,
    fontSize: 18,
    fontWeight: "700",
  },

  content: {
    padding: 20,
    paddingBottom: 110,
  },

  greeting: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
  },

  date: {
    color: COLORS.muted,
    marginTop: 5,
    fontSize: 15,
  },

  hero: {
    marginTop: 22,
    padding: 24,
    borderRadius: 28,
    backgroundColor: COLORS.primaryDark,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  heroText: {
    color: "#E8F7EC",
    marginTop: 8,
    fontSize: 15,
  },

  heroStreak: {
    color: "#FFFFFF",
    marginTop: 20,
    fontWeight: "800",
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 26,
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },

  stat: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 17,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statNumber: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
  },

  statLabel: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 12,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },

  greenButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
  },

  greenButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },

  cardText: {
    color: COLORS.muted,
    marginTop: 6,
    lineHeight: 21,
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 20,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallAdd: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
  },

  smallAddText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 7,
  },

  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 15,
    fontSize: 15,
    color: COLORS.text,
  },

  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  priorityRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  priorityButton: {
    flex: 1,
    padding: 13,
    borderRadius: 15,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },

  selectedPriority: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  priorityText: {
    color: COLORS.text,
    fontWeight: "700",
  },

  selectedPriorityText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  cancelButton: {
    padding: 18,
    alignItems: "center",
  },

  cancelText: {
    color: COLORS.danger,
    fontWeight: "700",
  },

  priorityLabel: {
    marginTop: 10,
    color: COLORS.primaryDark,
    fontWeight: "700",
  },

  taskTop: {
    flexDirection: "row",
  },

  completeButton: {
    marginTop: 14,
    backgroundColor: COLORS.lightGreen,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  completeText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },

  doneText: {
    color: COLORS.primary,
    fontWeight: "800",
    marginTop: 14,
  },

  deleteText: {
    color: COLORS.danger,
    fontWeight: "700",
    marginTop: 14,
  },

  completedCard: {
    opacity: 0.65,
  },

  completedText: {
    textDecorationLine: "line-through",
  },

  empty: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
  },

  schedule: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 10,
    flexDirection: "row",
    gap: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  time: {
    width: 55,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },

  timerCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
  },

  timerLabel: {
    color: "#DFF5E5",
    fontWeight: "700",
  },

  timer: {
    color: "#FFFFFF",
    fontSize: 58,
    fontWeight: "800",
    marginVertical: 25,
  },

  durationRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },

  durationButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },

  durationSelected: {
    backgroundColor: COLORS.lightGreen,
  },

  durationText: {
    color: COLORS.text,
    fontWeight: "700",
  },

  durationSelectedText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },

  startButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 18,
  },

  startText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },

  resetButton: {
    marginTop: 12,
    padding: 10,
  },

  resetText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  profileBox: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },

  nameInput: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.text,
  },

  progressBackground: {
    height: 9,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 14,
  },

  progress: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },

  progressText: {
    color: COLORS.muted,
    marginTop: 7,
    fontSize: 12,
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    alignItems: "center",
    minWidth: 55,
  },

  navIcon: {
    fontSize: 22,
    color: "#9AA09C",
  },

  navText: {
    fontSize: 11,
    marginTop: 4,
    color: "#9AA09C",
  },

  activeNav: {
    color: COLORS.primary,
    fontWeight: "800",
  },
});