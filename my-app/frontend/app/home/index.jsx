import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { homeStyles } from '../../constants/homeStyles';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabaseClient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationModal from '@/components/notificationScreen';
import StreakModal from '@/components/streakModal';
import CatWindow from '@/components/cat-widget';
import PostCard from '@/components/post-card';
import SearchSuggestions from '@/components/search.suggestions';
import SearchTagChips from '@/components/search.tag.chips';
import { fetchExploreItems } from '@/constants/exploreItems';
import {
  buildTagParam,
  useSharedSearchBar,
} from '@/FE-services/useSharedSearchBar';

const REFRESH_SPINNER_IMAGE = require('@/assets/images/home_top_trim_updated.png');

const MOCK_NOTIFICATIONS = [
  { id: '1', message: 'Your project "Oak Table" was saved.', time: '2m ago' },
  { id: '2', message: 'New comment on "Walnut Shelf".', time: '1h ago' },
  { id: '3', message: 'Material restock reminder: Pine boards.', time: '3h ago' },
];

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const restoreYParam = Array.isArray(params.restoreY) ? params.restoreY[0] : params.restoreY;

  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const lastRestoreRef = useRef(null);
  const { user } = useUser();

  const {
    draftQuery,
    selectedDraftTags,
    userSuggestions,
    tagSuggestions,
    showSuggestions,
    suggestionsLoading,
    handleChangeText,
    handleTagPress,
    handleRemoveTag,
    dismissSuggestions,
    resetDraftState,
  } = useSharedSearchBar();

  const [notifVisible, setNotifVisible] = useState(false);
  const [streakVisible, setStreakVisible] = useState(false);
  const [profileUsername, setProfileUsername] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [scrollY, setScrollY] = useState(0);

  const spinnerRotate = useRef(new Animated.Value(0)).current;

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.replace('/');
  };

  useEffect(() => {
    if (!user?.id || !supabase) {
      setProfileUsername(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data } = await supabase
          .from('users')
          .select('username')
          .eq('user_id', user.id)
          .maybeSingle();

      if (!cancelled) {
        setProfileUsername(data?.username?.trim() || null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError('');

    try {
      const rows = await fetchExploreItems();
      setPosts(rows);
    } catch (error) {
      setPostsError(error?.message || 'Unable to load posts.');
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useFocusEffect(
      useCallback(() => {
        loadPosts();
      }, [loadPosts])
  );

  useEffect(() => {
    if (!refreshing) {
      spinnerRotate.setValue(0);
      return;
    }

    const loop = Animated.loop(
        Animated.timing(spinnerRotate, {
          toValue: 1,
          duration: 850,
          easing: Easing.linear,
          useNativeDriver: true,
        })
    );

    loop.start();

    return () => {
      loop.stop();
      spinnerRotate.setValue(0);
    };
  }, [refreshing, spinnerRotate]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await loadPosts();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, loadPosts]);

  useEffect(() => {
    const restoreY = Number(restoreYParam);
    if (!Number.isFinite(restoreY) || restoreY < 0 || postsLoading) return;
    if (lastRestoreRef.current === restoreY) return;

    lastRestoreRef.current = restoreY;

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: restoreY, animated: false });
      setScrollY(restoreY);
    });
  }, [restoreYParam, postsLoading]);

  const handleSubmitSearch = useCallback(() => {
    const trimmed = draftQuery.trim();
    const hasTags = selectedDraftTags.length > 0;

    if (!trimmed && !hasTags) return;

    dismissSuggestions();
    Keyboard.dismiss();

    router.push({
      pathname: '/home/explore',
      params: {
        q: trimmed || undefined,
        tags: hasTags ? buildTagParam(selectedDraftTags) : undefined,
      },
    });

    resetDraftState();
  }, [draftQuery, selectedDraftTags, dismissSuggestions, resetDraftState]);

  const handleUserPress = useCallback(
      (userItem) => {
        dismissSuggestions();
        Keyboard.dismiss();

        router.push({
          pathname: '/home/other.profile',
          params: { userId: userItem.id },
        });

        resetDraftState();
      },
      [dismissSuggestions, resetDraftState]
  );

  const handleClearSearch = useCallback(() => {
    dismissSuggestions();
    resetDraftState();
  }, [dismissSuggestions, resetDraftState]);

  const userText =
      profileUsername || user?.user_metadata?.username || user?.email?.split('@')[0] || '<User_Placeholder>';

  const spinnerRotation = spinnerRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
      <View style={homeStyles.container}>
        <Image
            source={require('@/assets/images/explore_background.png')}
            resizeMode="cover"
            style={homeStyles.backgroundLayer}
        />
        <Image
            source={require('@/assets/images/home_top_trim_updated.png')}
            resizeMode="cover"
            style={homeStyles.topTrim}
        />

        <View style={[homeStyles.headerOverlay, { top: insets.top + 10 }]}>
          <View style={homeStyles.header}>
            <View style={homeStyles.titlePill}>
              <Text style={homeStyles.title}>My Craft</Text>
            </View>

            <View style={homeStyles.headerRight}>
              <View style={homeStyles.searchArea}>
                <View style={homeStyles.searchContainer}>
                  <Ionicons name="search-outline" size={16} color="#8f7d7d" />
                  <TextInput
                      style={homeStyles.searchInput}
                      placeholder="search bar"
                      placeholderTextColor="#8f7d7d"
                      value={draftQuery}
                      onChangeText={handleChangeText}
                      onSubmitEditing={handleSubmitSearch}
                      returnKeyType="search"
                      autoCapitalize="none"
                      autoCorrect={false}
                      blurOnSubmit={false}
                  />
                  {draftQuery.length > 0 || selectedDraftTags.length > 0 ? (
                      <Pressable onPress={handleClearSearch} hitSlop={8}>
                        <Ionicons name="close-circle" size={16} color="#8f7d7d" />
                      </Pressable>
                  ) : null}
                </View>

                <SearchSuggestions
                    visible={showSuggestions}
                    loading={suggestionsLoading}
                    users={userSuggestions}
                    tags={tagSuggestions}
                    onUserPress={handleUserPress}
                    onTagPress={handleTagPress}
                />

                <SearchTagChips
                    tags={selectedDraftTags}
                    onRemove={handleRemoveTag}
                />
              </View>

              <Pressable style={homeStyles.logoutIconButton} onPress={handleLogout} hitSlop={8}>
                <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[homeStyles.foreground, { paddingTop: insets.top + 80 }]}>
          <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl
                    refreshing={false}
                    onRefresh={handleRefresh}
                    tintColor="transparent"
                    colors={['transparent']}
                    progressBackgroundColor="transparent"
                />
              }
              onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
              scrollEventThrottle={16}
          >
            {refreshing ? (
                <View style={homeStyles.refreshSpinnerWrap}>
                  <Animated.Image
                      source={REFRESH_SPINNER_IMAGE}
                      style={[homeStyles.refreshSpinnerImage, { transform: [{ rotate: spinnerRotation }] }]}
                      resizeMode="contain"
                  />
                </View>
            ) : null}

            <View style={homeStyles.welcomeRow}>
              <Text style={homeStyles.welcome}>Welcome back, </Text>
              <Text
                  style={homeStyles.welcomeUser}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
              >
                {userText}!
              </Text>
            </View>

            <View style={homeStyles.quickActionsRow}>
              <View style={homeStyles.leftActionsColumn}>
                <Pressable style={homeStyles.homebuttons} onPress={() => setNotifVisible(true)}>
                  <Ionicons name="notifications-outline" size={16} color="#7b6666" />
                  <Text style={homeStyles.notificationsText}>notifications</Text>
                </Pressable>

                <Pressable style={homeStyles.homebuttons} onPress={() => setStreakVisible(true)}>
                  <Ionicons name="flame-outline" size={16} color="#7b6666" />
                  <Text style={homeStyles.streaksText}>craft streaks</Text>
                </Pressable>

                <Pressable style={homeStyles.homebuttons} onPress={() => router.push('/home/projects')}>
                  <Ionicons name="folder-open-outline" size={16} color="#7b6666" />
                  <Text style={homeStyles.projectsText}>my projects</Text>
                </Pressable>
              </View>

              <View style={homeStyles.catColumn}>
                <CatWindow mood="happy" />
              </View>
            </View>

            <Text style={homeStyles.subtitle}>Your feed</Text>

            {postsLoading ? (
                <Text style={homeStyles.feedStateText}>Loading posts...</Text>
            ) : postsError ? (
                <Text style={homeStyles.feedStateText}>{postsError}</Text>
            ) : posts.length === 0 ? (
                <Text style={homeStyles.feedStateText}>No posts yet.</Text>
            ) : (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} returnScrollY={Math.round(scrollY)} />
                ))
            )}
          </ScrollView>
        </View>

        <NotificationModal
            visible={notifVisible}
            onClose={() => setNotifVisible(false)}
            notifications={MOCK_NOTIFICATIONS}
        />
        <StreakModal visible={streakVisible} onClose={() => setStreakVisible(false)} streak={5} />
      </View>
  );
}