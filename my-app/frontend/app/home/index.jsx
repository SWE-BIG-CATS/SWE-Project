import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {homeStyles} from '../../constants/homeStyles';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {useUser} from '@/context/UserContext';
import { supabase } from '@/lib/supabaseClient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationModal from '@/components/notificationScreen';
import StreakModal from '@/components/streakModal';
import CatWindow from '@/components/cat-widget';
import PostCard from '@/components/post-card';
import { fetchExploreItems } from '@/constants/exploreItems';

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
  const [search, setSearch] = useState('');
  const [notifVisible, setNotifVisible] = useState(false);
  const [streakVisible, setStreakVisible] = useState(false);
  const [profileUsername, setProfileUsername] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [scrollY, setScrollY] = useState(0);

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
      if (!cancelled) setProfileUsername(data?.username?.trim() || null);
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

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => {
      const haystack = [post.title, post.craftType, post.caption, post.creatorUsername, ...(post.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, search]);

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

  const userText =
    profileUsername || user?.user_metadata?.username || user?.email?.split('@')[0] || '<User_Placeholder>';

  return (
    <View style={homeStyles.container}>
      <Image source={require('@/assets/images/explore_background.png')} resizeMode="cover" style={homeStyles.backgroundLayer} />
      <Image source={require('@/assets/images/home_top_trim_updated.png')} resizeMode="stretch" style={homeStyles.topTrim} />

      <View style={[homeStyles.headerOverlay, { top: insets.top + 10 }]}>
        <View style={homeStyles.header}>
          <View style={homeStyles.titlePill}>
            <Text style={homeStyles.title}>My Craft</Text>
          </View>
          <View style={homeStyles.headerRight}>
            <View style={homeStyles.searchContainer}>
              <Ionicons name="search-outline" size={16} color="#8f7d7d" />
              <TextInput
                style={homeStyles.searchInput}
                placeholder="search bar"
                placeholderTextColor="#8f7d7d"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 ? (
                <Pressable onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#8f7d7d" />
                </Pressable>
              ) : null}
            </View>
            <Pressable style={homeStyles.logoutIconButton} onPress={handleLogout} hitSlop={8}>
              <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[homeStyles.foreground, { paddingTop: insets.top + 124 }]}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}>
          <View style={homeStyles.welcomeRow}>
            <Text style={homeStyles.welcome}>Welcome back, </Text>
            <Text style={homeStyles.welcomeUser} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
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
          ) : filteredPosts.length === 0 ? (
            <Text style={homeStyles.feedStateText}>
              {search.trim() ? `No posts match "${search.trim()}".` : 'No posts yet.'}
            </Text>
          ) : (
            filteredPosts.map((post) => <PostCard key={post.id} post={post} returnScrollY={Math.round(scrollY)} />)
          )}
        </ScrollView>
      </View>

      <NotificationModal visible={notifVisible} onClose={() => setNotifVisible(false)} notifications={MOCK_NOTIFICATIONS} />
      <StreakModal visible={streakVisible} onClose={() => setStreakVisible(false)} streak={5} />
    </View>
  );
}