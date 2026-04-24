<<<<<<< Updated upstream
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProjectsScreen() {
=======
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Keyboard, Modal, PanResponder, Pressable, ScrollView, StyleSheet, TextInput, View, Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@/context/UserContext';
import { saveMyProjectToDatabase } from '@/FE-services/myProjects.service';

const TABS = ['projects', 'inspirations', 'lists'];

const STAR_STICKER_URI =
  'file:///C:/Users/lilly/.cursor/projects/c-Users-lilly-ClionProjects-DSA-SWE-Project/assets/c__Users_lilly_AppData_Roaming_Cursor_User_workspaceStorage_ef69fe16c5f589082409f582d9787afb_images_star_sticker-1da366ce-3b8a-4e0b-842e-938aefe0c650.png';

function formatLastEdited(lastEditedAt) {
  const diffSeconds = Math.max(1, Math.floor((Date.now() - lastEditedAt) / 1000));

  if (diffSeconds < 3600) {
    return `${diffSeconds} sec${diffSeconds === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffSeconds / 3600);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffSeconds / (3600 * 24));
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
}

function DraggableElement({
  element,
  isEditing,
  isSelected,
  textInteractionMode,
  photoInteractionMode,
  onSelect,
  onMove,
  onAutoSize,
  onLongPress,
  markCanvasBusy,
  onDragStateChange,
}) {
  const dragStart = useRef({ x: element.x, y: element.y });
  const latestPosition = useRef({ x: element.x, y: element.y });
  const latestSize = useRef({ width: element.width, height: element.height });
  const resizeStartWidth = useRef(element.width);
  const resizeStartRatio = useRef(element.height / Math.max(element.width, 1));
  const isEditingRef = useRef(isEditing);
  const isSelectedRef = useRef(isSelected);
  const textModeRef = useRef(textInteractionMode);
  const photoModeRef = useRef(photoInteractionMode);
  const onMoveRef = useRef(onMove);
  const markCanvasBusyRef = useRef(markCanvasBusy);
  const minTextWidth = 90;
  const minTextHeight = 34;

  useEffect(() => {
    latestPosition.current = { x: element.x, y: element.y };
  }, [element.x, element.y]);

  useEffect(() => {
    latestSize.current = { width: element.width, height: element.height };
  }, [element.width, element.height]);

  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  useEffect(() => {
    isSelectedRef.current = isSelected;
  }, [isSelected]);

  useEffect(() => {
    textModeRef.current = textInteractionMode;
  }, [textInteractionMode]);

  useEffect(() => {
    photoModeRef.current = photoInteractionMode;
  }, [photoInteractionMode]);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    markCanvasBusyRef.current = markCanvasBusy;
  }, [markCanvasBusy]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        if (!isEditingRef.current) return false;
        if (element.type === 'text') return isSelectedRef.current && textModeRef.current === 'move';
        if (element.type === 'photo') return isSelectedRef.current && photoModeRef.current === 'move';
        return true;
      },
      onMoveShouldSetPanResponder: () => {
        if (!isEditingRef.current) return false;
        if (element.type === 'text') return isSelectedRef.current && textModeRef.current === 'move';
        if (element.type === 'photo') return isSelectedRef.current && photoModeRef.current === 'move';
        return true;
      },
      onPanResponderGrant: () => {
        markCanvasBusyRef.current();
        onDragStateChange(true);
        dragStart.current = { ...latestPosition.current };
      },
      onPanResponderMove: (_, gestureState) => {
        onMoveRef.current(element.id, {
          x: dragStart.current.x + gestureState.dx,
          y: dragStart.current.y + gestureState.dy,
        });
      },
      onPanResponderRelease: () => {
        markCanvasBusyRef.current();
        onDragStateChange(false);
      },
      onPanResponderTerminate: () => {
        onDragStateChange(false);
      },
    })
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        isEditingRef.current &&
        (element.type === 'text' || element.type === 'photo') &&
        isSelectedRef.current &&
        (element.type === 'text' ? textModeRef.current === 'resize' : photoModeRef.current === 'resize'),
      onMoveShouldSetPanResponder: () =>
        isEditingRef.current &&
        (element.type === 'text' || element.type === 'photo') &&
        isSelectedRef.current &&
        (element.type === 'text' ? textModeRef.current === 'resize' : photoModeRef.current === 'resize'),
      onPanResponderGrant: () => {
        markCanvasBusyRef.current();
        onDragStateChange(true);
        resizeStartWidth.current = latestSize.current.width;
        resizeStartRatio.current = latestSize.current.height / Math.max(latestSize.current.width, 1);
      },
      onPanResponderMove: (_, gestureState) => {
        if (element.type === 'photo') {
          const nextWidth = Math.max(64, resizeStartWidth.current + gestureState.dx);
          const nextHeight = Math.max(64, nextWidth * resizeStartRatio.current);
          onMoveRef.current(element.id, { width: nextWidth, height: nextHeight });
        } else {
          const nextWidth = Math.max(minTextWidth, resizeStartWidth.current + gestureState.dx);
          onMoveRef.current(element.id, { width: nextWidth });
        }
      },
      onPanResponderRelease: () => {
        onDragStateChange(false);
      },
      onPanResponderTerminate: () => {
        onDragStateChange(false);
      },
    })
  ).current;

  return (
    <View
      style={[
        styles.canvasItem,
        {
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          borderColor:
            isEditing && element.type === 'text' && isSelected && textInteractionMode === 'move'
              ? '#6fa37b'
              : isEditing
                ? '#c8a8ad'
                : 'transparent',
          borderWidth: isEditing && element.type === 'text' && isSelected && textInteractionMode === 'move' ? 2 : 1,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable
        style={styles.canvasItemPressable}
        disabled={!isEditing}
        onPressIn={markCanvasBusy}
        onPress={() => {
          if (!isEditing) return;
          onSelect(element.id, element.type);
        }}
        onLongPress={() => onLongPress(element)}
        delayLongPress={260}
      >
        {element.type === 'photo' ? (
          <Image source={{ uri: element.content }} style={styles.canvasPhoto} resizeMode="cover" />
        ) : (
          <>
            <Text style={styles.canvasText}>{element.content}</Text>
            <View style={styles.canvasTextMeasureWrap} pointerEvents="none">
              <Text
                style={styles.canvasTextMeasure}
                onTextLayout={(event) => {
                  const lineCount = event?.nativeEvent?.lines?.length || 1;
                  const targetHeight = Math.max(minTextHeight, lineCount * styles.canvasText.lineHeight + 12);
                  onAutoSize(element.id, { height: targetHeight });
                }}
              >
                {element.content}
              </Text>
            </View>
          </>
        )}
      </Pressable>
      {isEditing &&
      (element.type === 'text' || element.type === 'photo') &&
      isSelected &&
      (element.type === 'text' ? textInteractionMode === 'resize' : photoInteractionMode === 'resize') ? (
        <View style={styles.textResizeTouchArea} {...resizeResponder.panHandlers}>
          <View style={styles.textResizeNotch}>
            <Ionicons name="resize-outline" size={16} color="#7e5c62" />
          </View>
        </View>
      ) : null}
      {isEditing && element.type === 'text' && isSelected && textInteractionMode === 'resize' ? (
        <View style={styles.textResizeBadge}>
          <Text style={styles.textResizeBadgeText}>RESIZE</Text>
        </View>
      ) : null}
      {isEditing && element.type === 'text' && isSelected && textInteractionMode === 'move' ? (
        <View style={styles.textMoveBadge}>
          <Text style={styles.textMoveBadgeText}>MOVE</Text>
        </View>
      ) : null}
      {isEditing && element.type === 'photo' && isSelected && photoInteractionMode === 'move' ? (
        <View style={styles.photoMoveBadge}>
          <Text style={styles.photoMoveBadgeText}>MOVE</Text>
        </View>
      ) : null}
      {isEditing && element.type === 'photo' && isSelected && photoInteractionMode === 'resize' ? (
        <View style={styles.photoResizeBadge}>
          <Text style={styles.photoResizeBadgeText}>RESIZE</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('projects');
  const [openProjectId, setOpenProjectId] = useState(null);
  const [openFolderId, setOpenFolderId] = useState(null);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const [composerMode, setComposerMode] = useState('add');
  const [composerType, setComposerType] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [draftPhotoUri, setDraftPhotoUri] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedTextElementId, setSelectedTextElementId] = useState(null);
  const [selectedTextInteractionMode, setSelectedTextInteractionMode] = useState('static');
  const [selectedPhotoElementId, setSelectedPhotoElementId] = useState(null);
  const [selectedPhotoInteractionMode, setSelectedPhotoInteractionMode] = useState('static');
  const [elementMenuVisible, setElementMenuVisible] = useState(false);
  const [projectEditorVisible, setProjectEditorVisible] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [draftProjectName, setDraftProjectName] = useState('');
  const [draftProjectCover, setDraftProjectCover] = useState('');
  const [draftProjectCompleted, setDraftProjectCompleted] = useState(false);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectElements, setProjectElements] = useState({});
  const canvasTapGuard = useRef(false);

  const openProject = useMemo(() => projects.find((project) => project.id === openProjectId) || null, [projects, openProjectId]);
  const openFolder = useMemo(
    () => openProject?.folders.find((folder) => folder.id === openFolderId) || null,
    [openProject, openFolderId]
  );
  const openProjectElements = projectElements[openProjectId] || [];

  const markCanvasBusy = () => {
    canvasTapGuard.current = true;
    setTimeout(() => {
      canvasTapGuard.current = false;
    }, 80);
  };

  const openComposer = (type, mode = 'add', sourceElement = null) => {
    setComposerMode(mode);
    setComposerType(type);
    setSelectedElement(sourceElement);
    setDraftText(type === 'text' ? sourceElement?.content || '' : '');
    setDraftPhotoUri(type === 'photo' ? sourceElement?.content || '' : '');
    setComposerVisible(true);
  };

  const pickPhotoFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.length) {
      setDraftPhotoUri(result.assets[0].uri);
    }
  };

  const openProjectEditor = (project = null) => {
    setEditingProjectId(project?.id || null);
    setDraftProjectName(project?.name || '');
    setDraftProjectCover(project?.cover || '');
    setDraftProjectCompleted(Boolean(project?.completed));
    setProjectEditorVisible(true);
  };

  const pickProjectCoverFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.length) {
      setDraftProjectCover(result.assets[0].uri);
    }
  };

  const saveProject = async () => {
    const trimmedName = draftProjectName.trim() || 'Untitled project';
    const now = Date.now();
    const fallbackCover =
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80';

    if (editingProjectId) {
      const existingProject = projects.find((project) => project.id === editingProjectId);
      const updatedProject = existingProject
        ? {
            ...existingProject,
            name: trimmedName,
            cover: draftProjectCover || existingProject.cover || fallbackCover,
            completed: draftProjectCompleted,
            lastEditedAt: now,
          }
        : null;

      setProjects((prev) =>
        prev.map((project) => (project.id === editingProjectId && updatedProject ? updatedProject : project))
      );

      if (user?.id && updatedProject) {
        try {
          const result = await saveMyProjectToDatabase({
            ownerId: user.id,
            projectId: updatedProject.id,
            name: updatedProject.name,
            cover: updatedProject.cover,
            completed: updatedProject.completed,
            lastEditedAt: updatedProject.lastEditedAt,
            folders: updatedProject.folders || [],
            elements: projectElements[updatedProject.id] || [],
          });

          if (result.projectId !== updatedProject.id) {
            setProjects((prev) =>
              prev.map((project) => (project.id === updatedProject.id ? { ...project, id: result.projectId } : project))
            );
            setProjectElements((prev) => {
              const next = { ...prev };
              next[result.projectId] = next[updatedProject.id] || [];
              delete next[updatedProject.id];
              return next;
            });
            setOpenProjectId((prev) => (prev === updatedProject.id ? result.projectId : prev));
          }
        } catch (error) {
          Alert.alert('Could not save project', error?.message || 'Please try again.');
        }
      }

      setProjectEditorVisible(false);
      return;
    }

    const newLocalId = `project-${Date.now()}`;
    const newProject = {
      id: newLocalId,
      name: trimmedName,
      completed: draftProjectCompleted,
      lastEditedAt: now,
      cover: draftProjectCover || fallbackCover,
      folders: [],
    };

    setProjects((prev) => [
      ...prev,
      newProject,
    ]);
    setProjectElements((prev) => ({ ...prev, [newLocalId]: [] }));

    if (user?.id) {
      try {
        const result = await saveMyProjectToDatabase({
          ownerId: user.id,
          projectId: newLocalId,
          name: newProject.name,
          cover: newProject.cover,
          completed: newProject.completed,
          lastEditedAt: newProject.lastEditedAt,
          folders: [],
          elements: [],
        });

        if (result.projectId !== newLocalId) {
          setProjects((prev) =>
            prev.map((project) => (project.id === newLocalId ? { ...project, id: result.projectId } : project))
          );
          setProjectElements((prev) => {
            const next = { ...prev };
            next[result.projectId] = next[newLocalId] || [];
            delete next[newLocalId];
            return next;
          });
          setOpenProjectId((prev) => (prev === newLocalId ? result.projectId : prev));
        }
      } catch (error) {
        Alert.alert('Could not save project', error?.message || 'Please try again.');
      }
    }

    setProjectEditorVisible(false);
  };

  const updateOpenProjectElement = (elementId, patch) => {
    if (!openProjectId) return;
    setProjectElements((prev) => ({
      ...prev,
      [openProjectId]: (prev[openProjectId] || []).map((el) => (el.id === elementId ? { ...el, ...patch } : el)),
    }));
  };

  const updateTextElementSize = (elementId, nextSize) => {
    if (!openProjectId) return;
    setProjectElements((prev) => ({
      ...prev,
      [openProjectId]: (prev[openProjectId] || []).map((el) => {
        if (el.id !== elementId || el.type !== 'text') return el;
        const nextWidth = nextSize?.width ?? el.width;
        const nextHeight = nextSize?.height ?? el.height;
        if (Math.abs((el.height || 0) - nextHeight) < 1 && Math.abs((el.width || 0) - nextWidth) < 1) return el;
        return { ...el, width: nextWidth, height: nextHeight };
      }),
    }));
  };

  const handleSaveComposer = () => {
    if (!openProjectId || !composerType) return;

    if (composerMode === 'edit' && selectedElement) {
      updateOpenProjectElement(selectedElement.id, {
        content:
          composerType === 'text'
            ? draftText.trim() || selectedElement.content
            : draftPhotoUri.trim() || selectedElement.content,
      });
      setComposerVisible(false);
      return;
    }

    const nextElement = {
      id: `${composerType}-${Date.now()}`,
      type: composerType,
      content:
        composerType === 'text'
          ? draftText.trim() || 'New note'
          : draftPhotoUri.trim() ||
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
      x: 24,
      y: 90 + (openProjectElements.length % 4) * 62,
      width: composerType === 'text' ? 200 : 165,
      height: composerType === 'text' ? 48 : 120,
    };

    setProjectElements((prev) => ({
      ...prev,
      [openProjectId]: [...(prev[openProjectId] || []), nextElement],
    }));
    setComposerVisible(false);
  };

  const renderProjectsRoot = () => (
    <Pressable style={styles.gridWrap} onLongPress={() => openProjectEditor()} delayLongPress={320}>
      {projects.length === 0 ? (
        <View style={styles.emptyProjectsCard}>
          <Text style={styles.emptyProjectsTitle}>No projects yet</Text>
          <Text style={styles.emptyProjectsBody}>Press and hold to create your first project.</Text>
        </View>
      ) : null}
      {projects.map((project) => (
        <Pressable
          key={project.id}
          style={styles.projectCard}
          onPress={() => setOpenProjectId(project.id)}
          onLongPress={() => openProjectEditor(project)}
          delayLongPress={320}
        >
          <Image source={{ uri: project.cover }} style={styles.projectThumb} />
          {project.completed ? <Image source={{ uri: STAR_STICKER_URI }} style={styles.completedSticker} /> : null}
          <Text style={styles.projectLabel}>{project.name}</Text>
          <Text style={styles.lastEditedText}>last edited {formatLastEdited(project.lastEditedAt)}</Text>
        </Pressable>
      ))}
    </Pressable>
  );

  const renderOpenProject = () => (
    <View style={styles.folderViewWrap}>
      <View style={styles.rowHeader}>
        <Pressable onPress={() => setOpenProjectId(null)} style={styles.exitButton}>
          <Ionicons name="arrow-back" size={18} color="#6d4f55" />
          <Text style={styles.exitButtonText}>Exit</Text>
        </Pressable>
        <View style={styles.editRow}>
          <Text style={styles.sectionTitle}>{openProject?.name}</Text>
          <Pressable style={styles.editBadge} onPress={() => setIsEditingPage((prev) => !prev)}>
            <Text style={styles.editBadgeText}>{isEditingPage ? 'done' : 'edit'}</Text>
          </Pressable>
        </View>
      </View>
      {isEditingPage ? (
        <Text style={styles.editHintText}>
          Press and hold to add elements.{'\n'}Tap text to move and resize.
        </Text>
      ) : null}

      <Text style={styles.lastEditedText}>last edited {formatLastEdited(openProject?.lastEditedAt || Date.now())}</Text>

      <Pressable
        style={styles.freeCanvas}
        onPress={() => {
          if (!isEditingPage) return;
          if (canvasTapGuard.current) return;
          setSelectedTextElementId(null);
          setSelectedTextInteractionMode('static');
          setSelectedPhotoElementId(null);
          setSelectedPhotoInteractionMode('static');
        }}
        onLongPress={() => {
          if (!isEditingPage || canvasTapGuard.current) return;
          setComposerMode('add');
          setComposerType(null);
          setComposerVisible(true);
        }}
        delayLongPress={320}
      >
        {openProjectElements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            isEditing={isEditingPage}
            isSelected={selectedTextElementId === element.id || selectedPhotoElementId === element.id}
            textInteractionMode={selectedTextInteractionMode}
            photoInteractionMode={selectedPhotoInteractionMode}
            onSelect={(elementId, elementType) => {
              if (elementType === 'photo') {
                if (selectedPhotoElementId !== elementId) {
                  setSelectedPhotoElementId(elementId);
                  setSelectedPhotoInteractionMode('move');
                  setSelectedTextElementId(null);
                  setSelectedTextInteractionMode('static');
                  return;
                }
                if (selectedPhotoInteractionMode === 'move') {
                  setSelectedPhotoInteractionMode('resize');
                  return;
                }
                if (selectedPhotoInteractionMode === 'resize') {
                  setSelectedPhotoInteractionMode('static');
                  return;
                }
                setSelectedPhotoInteractionMode('move');
                return;
              }

              if (selectedTextElementId !== elementId) {
                setSelectedTextElementId(elementId);
                setSelectedTextInteractionMode('move');
                setSelectedPhotoElementId(null);
                setSelectedPhotoInteractionMode('static');
                return;
              }
              if (selectedTextInteractionMode === 'move') {
                setSelectedTextInteractionMode('resize');
                return;
              }
              if (selectedTextInteractionMode === 'resize') {
                setSelectedTextInteractionMode('static');
                return;
              }
              setSelectedTextInteractionMode('move');
            }}
            markCanvasBusy={markCanvasBusy}
            onMove={(elementId, nextPosition) => updateOpenProjectElement(elementId, nextPosition)}
            onAutoSize={(elementId, nextSize) => updateTextElementSize(elementId, nextSize)}
            onLongPress={(nextSelected) => {
              if (!isEditingPage) return;
              setSelectedElement(nextSelected);
              setElementMenuVisible(true);
              markCanvasBusy();
            }}
            onDragStateChange={setIsDraggingElement}
          />
        ))}
      </Pressable>
    </View>
  );

  const renderOpenFolder = () => (
    <View style={styles.folderViewWrap}>
      <View style={styles.rowHeader}>
        <Pressable onPress={() => setOpenFolderId(null)} style={styles.exitButton}>
          <Ionicons name="arrow-back" size={18} color="#6d4f55" />
          <Text style={styles.exitButtonText}>Exit folder</Text>
        </Pressable>
        <Text style={styles.sectionTitle}>{openFolder?.name}</Text>
      </View>
      <Text style={styles.lastEditedText}>last edited {formatLastEdited(openFolder?.lastEditedAt || Date.now())}</Text>

      <View style={styles.folderFilesWrap}>
        {openFolder?.files.map((fileUri) => (
          <Image key={fileUri} source={{ uri: fileUri }} style={styles.folderFileImage} />
        ))}
      </View>
    </View>
  );

  const renderProjectsTab = () => {
    if (openFolderId) return renderOpenFolder();
    if (openProjectId) return renderOpenProject();
    return renderProjectsRoot();
  };

  const renderTabBody = () => {
    if (activeTab === 'projects') return renderProjectsTab();
    if (activeTab === 'inspirations') {
      return (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Inspirations</Text>
          <Text style={styles.placeholderBody}>Save visual ideas and mood references here.</Text>
        </View>
      );
    }
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Lists</Text>
        <Text style={styles.placeholderBody}>Track supplies, shopping, and project checklists.</Text>
      </View>
    );
  };

>>>>>>> Stashed changes
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f4d2d2" />
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: '700', marginLeft: 12 }}>My Projects</Text>
      </View>

      <Text style={{ color: '#888' }}>No projects yet.</Text>
    </View>
  );
}