import { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 390;
const clamp = (min, preferred, max) => Math.max(min, Math.min(preferred, max));
const responsive = (size, min, max) => clamp(min, (SCREEN_WIDTH / BASE_WIDTH) * size, max);
const DARK = '#5c3d3d';

const INITIAL_GOALS = [
  {
    id: 'g1',
    title: 'Finish kitten tote',
    deadline: '2026-05-10',
    subGoals: ['Cut fabric', 'Sew sides', 'Attach straps'],
  },
  {
    id: 'g2',
    title: 'Paint shelf',
    deadline: '2026-05-22',
    subGoals: ['Sand edges', 'Prime coat'],
  },
];

function GoalCard({ goal, onDelete }) {
  return (
    <View style={styles.goalCard}>
      <View style={styles.goalCardHeader}>
        <Text style={styles.goalTitle}>{goal.title}</Text>
        <Pressable onPress={() => onDelete(goal.id)} hitSlop={8} style={styles.deleteButton}>
          <Ionicons name="close" size={16} color="#7d6666" />
        </Pressable>
      </View>
      <Text style={styles.goalDeadline}>deadline {goal.deadline}</Text>

      {goal.subGoals?.length ? (
        <View style={styles.subGoalsWrap}>
          {goal.subGoals.map((subGoal, index) => (
            <Text key={`${goal.id}-${index}`} style={styles.subGoalText}>
              {`sub-goal ${index + 1}: ${subGoal}`}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [goalName, setGoalName] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [subGoalInput, setSubGoalInput] = useState('');

  const handleAddGoal = () => {
    const trimmedName = goalName.trim();
    if (!trimmedName) return;

    const subGoals = subGoalInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setGoals((prev) => [
      ...prev,
      {
        id: `g-${Date.now()}`,
        title: trimmedName,
        deadline: goalDeadline.trim() || 'no deadline',
        subGoals,
      },
    ]);

    setGoalName('');
    setGoalDeadline('');
    setSubGoalInput('');
    setIsAddOpen(false);
  };

  const handleDeleteGoal = (goalId) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  return (
    <View style={styles.root}>
      <Image
        source={require('@/assets/images/explore_background.png')}
        resizeMode="cover"
        style={styles.backgroundLayer}
      />
      <View style={[styles.foreground, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>My Goals</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.profileCard}>
            <View style={styles.previewImage} />
            <View style={styles.profileTextBlock}>
              <Text style={styles.profileText}>name: your craft cat</Text>
              <Text style={styles.profileText}>level: 1</Text>
              <Text style={styles.profileText}>goals achieved: {goals.length}</Text>
              <Text style={styles.profileText}>last goal completed: --</Text>
            </View>
          </View>

          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} />
          ))}

          {isAddOpen ? (
            <View style={styles.addSheet}>
              <View style={styles.addHeader}>
                <Text style={styles.addTitle}>add goal</Text>
                <Pressable onPress={() => setIsAddOpen(false)} style={styles.deleteButton} hitSlop={8}>
                  <Ionicons name="close" size={16} color="#7d6666" />
                </Pressable>
              </View>

              <TextInput
                style={styles.input}
                placeholder="goal name"
                placeholderTextColor="#9c8a8a"
                value={goalName}
                onChangeText={setGoalName}
              />
              <TextInput
                style={styles.input}
                placeholder="deadline (YYYY-MM-DD)"
                placeholderTextColor="#9c8a8a"
                value={goalDeadline}
                onChangeText={setGoalDeadline}
              />
              <TextInput
                style={styles.input}
                placeholder="sub-goals (comma separated)"
                placeholderTextColor="#9c8a8a"
                value={subGoalInput}
                onChangeText={setSubGoalInput}
              />

              <Pressable onPress={handleAddGoal} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>set goal!</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setIsAddOpen(true)} style={styles.addGoalButton}>
              <Ionicons name="add" size={20} color="#5e4747" />
              <Text style={styles.addGoalButtonText}>add goal</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2e4e4',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  foreground: {
    flex: 1,
    paddingHorizontal: 14,
  },
  headerRow: {
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  pageTitle: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(44, 32, 50),
    color: DARK,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
    gap: 10,
  },
  profileCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bca5a5',
    backgroundColor: '#f5f0df',
    padding: 8,
    flexDirection: 'row',
    gap: 8,
  },
  previewImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#d2d2d2',
  },
  profileTextBlock: {
    flex: 1,
    backgroundColor: '#f8eaea',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d7bfbf',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  profileText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(20, 15, 24),
    color: '#786161',
    marginBottom: 2,
  },
  goalCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c2a7a7',
    backgroundColor: '#f6e3e3',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    flex: 1,
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(24, 18, 28),
    color: DARK,
  },
  deleteButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ead5d5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalDeadline: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(18, 14, 22),
    color: '#755f5f',
    marginTop: 2,
  },
  subGoalsWrap: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#d7c3c3',
    paddingTop: 6,
    gap: 2,
  },
  subGoalText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(17, 13, 20),
    color: '#5f4c4c',
  },
  addSheet: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cdbbb0',
    backgroundColor: '#f6f2e2',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTitle: {
    flex: 1,
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(40, 28, 44),
    color: DARK,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7c5c5',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(22, 16, 26),
    color: DARK,
  },
  primaryButton: {
    alignSelf: 'center',
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryButtonText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(40, 28, 44),
    color: DARK,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#f0dcdc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8bcbc',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addGoalButtonText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(32, 22, 36),
    color: DARK,
  },
});
