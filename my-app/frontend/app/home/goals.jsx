import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 390;
const clamp = (min, preferred, max) => Math.max(min, Math.min(preferred, max));
const responsive = (size, min, max) => clamp(min, (SCREEN_WIDTH / BASE_WIDTH) * size, max);
const UNIFORM_TEXT_SIZE = responsive(16, 13, 20);
const TEXT_COLOR = '#4f4545';

const INITIAL_GOALS = [];

export default function GoalsScreen() {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalNameInput, setGoalNameInput] = useState('');
  const [addDeadline, setAddDeadline] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState('');
  const [addSubGoals, setAddSubGoals] = useState([false, false, false]);
  const [subGoalInputs, setSubGoalInputs] = useState(['', '', '']);

  const removeGoal = (goalId) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const removeSubGoal = (goalId, subGoalIndex) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId || !Array.isArray(g.subGoals)) return g;
        return {
          ...g,
          subGoals: g.subGoals.filter((_, idx) => idx !== subGoalIndex),
        };
      })
    );
  };

  const resetAddGoalForm = () => {
    setGoalNameInput('');
    setAddDeadline(false);
    setDeadlineInput('');
    setAddSubGoals([false, false, false]);
    setSubGoalInputs(['', '', '']);
  };

  const toggleSubGoal = (idx) => {
    setAddSubGoals((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const setSubGoalInput = (idx, value) => {
    setSubGoalInputs((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleSetGoal = () => {
    const trimmedGoal = goalNameInput.trim();
    if (!trimmedGoal) {
      Alert.alert('Add a goal name');
      return;
    }

    const builtSubGoals = subGoalInputs
      .map((text, idx) => ({ text: text.trim(), idx }))
      .filter((entry) => addSubGoals[entry.idx] && entry.text.length > 0)
      .map((entry) => entry.text);

    const newGoal = {
      id: `goal-${Date.now()}`,
      title: `${trimmedGoal}:`,
      deadline:
        addDeadline && deadlineInput.trim()
          ? `deadline ${deadlineInput.trim()}`
          : 'deadline 00-00-0000',
      subGoals: builtSubGoals.length ? builtSubGoals : undefined,
    };

    setGoals((prev) => [newGoal, ...prev]);
    resetAddGoalForm();
    setShowAddGoal(false);
  };

  return (
    <ImageBackground
      source={require('@/assets/images/goal_bg.png')}
      resizeMode="cover"
      style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profileRow}>
          <View style={styles.catImageWrap}>
            <Image source={require('@/assets/images/cat-default.png')} style={styles.catImage} />
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>name:</Text>
            <Text style={styles.infoValue}>[cat name]</Text>
            <Text style={styles.infoLabel}>level:</Text>
            <Text style={styles.infoValue}>[cat level]</Text>
            <Text style={styles.infoLabel}>goals achieved:</Text>
            <Text style={styles.infoValue}>[total # of goals met]</Text>
            <Text style={styles.infoLabel}>goals until next level:</Text>
            <Text style={styles.infoValue}>[# of goals]</Text>
            <Text style={styles.infoLabel}>last goal completed on:</Text>
            <Text style={styles.infoValue}>[00-00-0000]</Text>
          </View>
        </View>

        {showAddGoal ? (
          <View style={styles.addGoalPanel}>
            <View style={styles.addGoalPanelHeader}>
              <Text style={styles.addGoalPanelTitle}>add goal</Text>
              <Pressable style={styles.deleteBtn} onPress={() => setShowAddGoal(false)}>
                <Text style={styles.xMark}>×</Text>
              </Pressable>
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>goal name:</Text>
              <TextInput
                style={styles.formInput}
                placeholder="xxxxxxxxxxxxxxx"
                placeholderTextColor="#6a5858"
                value={goalNameInput}
                onChangeText={setGoalNameInput}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.inputLabel}>add deadline?</Text>
              <Pressable
                style={[styles.toggleDot, addDeadline && styles.toggleDotActive]}
                onPress={() => setAddDeadline((v) => !v)}
              />
            </View>
            {addDeadline ? (
              <TextInput
                style={styles.formInput}
                placeholder="deadline:[00-00-0000]"
                placeholderTextColor="#6a5858"
                value={deadlineInput}
                onChangeText={setDeadlineInput}
              />
            ) : null}

            <View>
              <View style={styles.toggleRow}>
                <Text style={styles.inputLabel}>add sub-goal?</Text>
                <Pressable
                  style={[styles.toggleDot, addSubGoals[0] && styles.toggleDotActive]}
                  onPress={() => toggleSubGoal(0)}
                />
              </View>
              {addSubGoals[0] ? (
                <TextInput
                  style={styles.formInput}
                  placeholder="sub-goal name: xxxxxxx"
                  placeholderTextColor="#6a5858"
                  value={subGoalInputs[0]}
                  onChangeText={(v) => setSubGoalInput(0, v)}
                />
              ) : null}
            </View>

            {addSubGoals[0] ? (
              <View>
                <View style={styles.toggleRow}>
                  <Text style={styles.inputLabel}>add sub-goal?</Text>
                  <Pressable
                    style={[styles.toggleDot, addSubGoals[1] && styles.toggleDotActive]}
                    onPress={() => toggleSubGoal(1)}
                  />
                </View>
                {addSubGoals[1] ? (
                  <TextInput
                    style={styles.formInput}
                    placeholder="sub-goal name: xxxxxxx"
                    placeholderTextColor="#6a5858"
                    value={subGoalInputs[1]}
                    onChangeText={(v) => setSubGoalInput(1, v)}
                  />
                ) : null}
              </View>
            ) : null}

            {addSubGoals[1] ? (
              <View>
                <View style={styles.toggleRow}>
                  <Text style={styles.inputLabel}>add sub-goal?</Text>
                  <Pressable
                    style={[styles.toggleDot, addSubGoals[2] && styles.toggleDotActive]}
                    onPress={() => toggleSubGoal(2)}
                  />
                </View>
                {addSubGoals[2] ? (
                  <TextInput
                    style={styles.formInput}
                    placeholder="sub-goal name: xxxxxxx"
                    placeholderTextColor="#6a5858"
                    value={subGoalInputs[2]}
                    onChangeText={(v) => setSubGoalInput(2, v)}
                  />
                ) : null}
              </View>
            ) : null}

            <Pressable style={styles.setGoalBtn} onPress={handleSetGoal}>
              <Text style={styles.setGoalText}>set goal!</Text>
            </Pressable>
          </View>
        ) : null}

        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalWrap}>
            <View style={styles.goalCard}>
              <View style={styles.goalContentRow}>
                <View style={styles.goalTextWrap}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDeadline}>{goal.deadline}</Text>
                </View>
              </View>
            </View>
            <Pressable style={styles.deleteBtn} onPress={() => removeGoal(goal.id)}>
              <Text style={styles.xMark}>×</Text>
            </Pressable>
            {goal.subGoals ? (
              <View style={styles.subGoalsCard}>
                {goal.subGoals.map((sg, idx) => (
                  <View key={`${goal.id}-${sg}-${idx}`} style={styles.subGoalRow}>
                    <Text style={styles.subGoalText}>{sg}</Text>
                    <Pressable style={styles.subDeleteBtn} onPress={() => removeSubGoal(goal.id, idx)}>
                      <Text style={styles.subXMark}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}

        <View style={styles.addRow}>
          <Pressable style={styles.addIconBtn} onPress={() => setShowAddGoal(true)}>
            <Text style={styles.addIcon}>+</Text>
          </Pressable>
          <Pressable onPress={() => setShowAddGoal(true)}>
            <Text style={styles.addText}>add goal</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#e9e1e2',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: responsive(10, 8, 16),
    paddingTop: 64,
    paddingBottom: 96,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  catImageWrap: {
    width: responsive(206, 150, 230),
    height: responsive(198, 138, 220),
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.6,
    borderColor: '#ab9393',
    backgroundColor: '#e8d4d5',
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#e8d4d5',
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: '#ab9393',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  infoLabel: {
    fontFamily: 'Gaegu-Bold',
    fontSize: UNIFORM_TEXT_SIZE,
    color: TEXT_COLOR,
    marginTop: 2,
  },
  infoValue: {
    fontFamily: 'Gaegu-Bold',
    fontSize: UNIFORM_TEXT_SIZE,
    color: TEXT_COLOR,
    opacity: 0.9,
    marginBottom: 2,
  },
  goalWrap: {
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: '#e8d4d5',
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: '#ab9393',
    minHeight: responsive(60, 48, 74),
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  goalContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  goalTitle: {
    fontFamily: 'Gaegu-Bold',
    fontSize: UNIFORM_TEXT_SIZE,
    color: TEXT_COLOR,
  },
  goalDeadline: {
    fontFamily: 'Gaegu-Bold',
    fontSize: UNIFORM_TEXT_SIZE,
    color: TEXT_COLOR,
    opacity: 0.9,
  },
  deleteBtn: {
    position: 'absolute',
    right: 6,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d7b5b7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subGoalsCard: {
    marginTop: -2,
    marginLeft: 34,
    marginRight: 56,
    backgroundColor: '#F7F0E0',
    borderRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1.6,
    borderColor: '#ab9393',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 7,
  },
  subGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subGoalText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: UNIFORM_TEXT_SIZE,
    color: TEXT_COLOR,
  },
  subDeleteBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#d7b5b7',
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xMark: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(26, 20, 30),
    color: TEXT_COLOR,
    lineHeight: responsive(26, 20, 30),
    marginTop: -1,
  },
  subXMark: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(16, 13, 20),
    color: TEXT_COLOR,
    lineHeight: responsive(16, 13, 20),
    marginTop: -1,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
    marginLeft: 4,
  },
  addIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 2,
    backgroundColor: '#e8d4d5',
    borderWidth: 1.6,
    borderColor: '#b8a2a2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  addIcon: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(34, 28, 40),
    color: TEXT_COLOR,
    lineHeight: responsive(34, 28, 40),
  },
  addText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(40, 28, 46),
    color: TEXT_COLOR,
  },
  addGoalPanel: {
    backgroundColor: '#e9e4d3',
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: '#d2c8aa',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    marginBottom: 14,
  },
  addGoalPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addGoalPanelTitle: {
    fontFamily: 'Gaegu-Bold',
    fontSize: responsive(40, 28, 46),
    color: TEXT_COLOR,
  },
  inputRow: {
    marginBottom: 8,
  },
  inputLabel: {
    fontFamily: 'Gaegu-Bold',
    fontSize: UNIFORM_TEXT_SIZE,
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: '#cdbfb2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontFamily: 'Gaegu-Bold',
    fontSize: UNIFORM_TEXT_SIZE,
    color: TEXT_COLOR,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
    borderWidth: 1,
    borderColor: '#c9c9c9',
  },
  toggleDotActive: {
    backgroundColor: '#111',
  },
  setGoalBtn: {
    alignSelf: 'center',
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  setGoalText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: UNIFORM_TEXT_SIZE,
    color: TEXT_COLOR,
  },
});
