import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Modal, Alert, Animated, PanResponder, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 320);
const SWIPE_THRESHOLD = 50;
const STORAGE_KEY = '@bloco_notas:notes';
const DARK_MODE_KEY = '@bloco_notas:dark_mode';

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const categories = ['📝 Pessoal', '💼 Trabalho', '🎓 Estudos', '💡 Ideias', '📌 Outros'];

type SortOption = 'recent' | 'oldest' | 'alphabetical' | 'category';

export default function App() {
  const [showHome, setShowHome] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Home page animations
  useEffect(() => {
    if (showHome) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showHome]);

  const navigateToNotes = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowHome(false));
  };

  // Load notes from storage on mount
  useEffect(() => {
    loadNotes();
    loadDarkMode();
  }, []);

  // Save notes to storage whenever they change
  useEffect(() => {
    if (notes.length > 0 || notes.length === 0) {
      saveNotes();
    }
  }, [notes]);

  // Save dark mode preference
  useEffect(() => {
    saveDarkMode();
  }, [isDarkMode]);

  // Storage functions
  const saveNotes = async () => {
    try {
      const jsonValue = JSON.stringify(notes);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Erro ao salvar notas:', e);
    }
  };

  const loadNotes = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const loadedNotes = JSON.parse(jsonValue);
        // Convert date strings back to Date objects
        const notesWithDates = loadedNotes.map((note: Note) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(notesWithDates);
      }
    } catch (e) {
      console.error('Erro ao carregar notas:', e);
    }
  };

  const saveDarkMode = async () => {
    try {
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDarkMode));
    } catch (e) {
      console.error('Erro ao salvar modo escuro:', e);
    }
  };

  const loadDarkMode = async () => {
    try {
      const value = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (value != null) {
        setIsDarkMode(JSON.parse(value));
      }
    } catch (e) {
      console.error('Erro ao carregar modo escuro:', e);
    }
  };

  // Drawer controls
  const openDrawer = useCallback(() => {
    setDrawerVisible(true);
    Animated.parallel([
      Animated.spring(drawerAnimation, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
      Animated.timing(overlayAnimation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerAnimation, overlayAnimation]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(drawerAnimation, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerVisible(false));
  }, [drawerAnimation, overlayAnimation]);

  const toggleDrawer = useCallback(() => {
    if (drawerVisible) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }, [drawerVisible, closeDrawer, openDrawer]);

  // PanResponder for swipe gestures
  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Start tracking if swipe from left edge or drawer is open
        return gestureState.dx > 0 || drawerVisible;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Track horizontal swipes
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        // Set initial value for smooth tracking
        drawerAnimation.setOffset(drawerAnimation._value);
        drawerAnimation.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (drawerVisible) {
          // Closing gesture (swipe left)
          if (gestureState.dx < 0) {
            drawerAnimation.setValue(Math.max(gestureState.dx, -DRAWER_WIDTH));
            overlayAnimation.setValue(Math.max(0, 1 + gestureState.dx / DRAWER_WIDTH));
          }
        } else {
          // Opening gesture (swipe right from edge)
          if (gestureState.dx > 0 && evt.nativeEvent.pageX < 50) {
            drawerAnimation.setValue(Math.min(gestureState.dx - DRAWER_WIDTH, 0));
            overlayAnimation.setValue(Math.min(1, gestureState.dx / DRAWER_WIDTH));
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        drawerAnimation.flattenOffset();
        
        if (drawerVisible) {
          // Close if swiped left beyond threshold
          if (gestureState.dx < -SWIPE_THRESHOLD || gestureState.vx < -0.5) {
            closeDrawer();
          } else {
            openDrawer();
          }
        } else {
          // Open if swiped right beyond threshold
          if (gestureState.dx > SWIPE_THRESHOLD || gestureState.vx > 0.5) {
            openDrawer();
          } else {
            closeDrawer();
          }
        }
      },
    }), [drawerVisible, drawerAnimation, overlayAnimation, closeDrawer, openDrawer]);

  // CREATE
  const createNote = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erro', 'Título e conteúdo são obrigatórios!');
      return;
    }

    const newNote: Note = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      category: selectedCategory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes([newNote, ...notes]);
    closeModal();
  };

  // UPDATE
  const updateNote = () => {
    if (!editingNote || !title.trim() || !content.trim()) {
      Alert.alert('Erro', 'Título e conteúdo são obrigatórios!');
      return;
    }

    setNotes(notes.map(note => 
      note.id === editingNote.id 
        ? { ...note, title: title.trim(), content: content.trim(), category: selectedCategory, updatedAt: new Date() }
        : note
    ));
    closeModal();
  };

  // DELETE
  const deleteNote = (id: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => setNotes(notes.filter(note => note.id !== id)) }
      ]
    );
  };

  // Modal handlers
  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setSelectedCategory(categories[0]);
    setModalVisible(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSelectedCategory(note.category);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  // Filter and search
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'Todas' || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'oldest':
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  // Statistics
  const getStats = () => {
    const totalNotes = notes.length;
    const categoryStats = categories.map(cat => ({
      category: cat,
      count: notes.filter(n => n.category === cat).length
    }));
    const totalChars = notes.reduce((sum, note) => sum + note.content.length, 0);
    return { totalNotes, categoryStats, totalChars };
  };

  const stats = getStats();

  // Clear all notes
  const clearAllNotes = () => {
    Alert.alert(
      'Limpar Todas as Notas',
      'Tem certeza que deseja excluir TODAS as notas? Esta ação não pode ser desfeita!',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir Tudo', 
          style: 'destructive', 
          onPress: () => {
            setNotes([]);
            closeDrawer();
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Theme colors
  const theme = {
    background: isDarkMode ? '#1a1a1a' : '#f8f9fa',
    cardBackground: isDarkMode ? '#2d2d2d' : '#fff',
    headerBackground: isDarkMode ? '#4338ca' : '#6366f1',
    text: isDarkMode ? '#f3f4f6' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#4b5563',
    textTertiary: isDarkMode ? '#6b7280' : '#9ca3af',
    border: isDarkMode ? '#404040' : '#e5e7eb',
    inputBackground: isDarkMode ? '#3a3a3a' : '#f9fafb',
    overlayBackground: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
  };

  // Home Page
  if (showHome) {
    return (
      <View style={[styles.homeContainer, { backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Animated.View 
          style={[
            styles.homeContent,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.homeIcon, { color: theme.text }]}>📒</Text>
          <Text style={[styles.homeTitle, { color: theme.text }]}>Bloco de Notas</Text>
          <Text style={[styles.homeSubtitle, { color: theme.textSecondary }]}>
            Organize suas ideias, tarefas e pensamentos
          </Text>
          
          <View style={styles.homeFeatures}>
            <View style={[styles.featureCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={styles.featureIcon}>📝</Text>
              <Text style={[styles.featureTitle, { color: theme.text }]}>Crie Notas</Text>
              <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                Anote suas ideias rapidamente
              </Text>
            </View>
            
            <View style={[styles.featureCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={styles.featureIcon}>🏷️</Text>
              <Text style={[styles.featureTitle, { color: theme.text }]}>Organize</Text>
              <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                Categorize por assunto
              </Text>
            </View>
            
            <View style={[styles.featureCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={styles.featureIcon}>🔍</Text>
              <Text style={[styles.featureTitle, { color: theme.text }]}>Busque</Text>
              <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                Encontre facilmente
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.homeButton}
            onPress={navigateToNotes}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Começar →</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsDarkMode(!isDarkMode)}
            style={styles.homeThemeToggle}
          >
            <Text style={[styles.homeThemeText, { color: theme.textTertiary }]}>
              {isDarkMode ? '☀️' : '🌙'} Alternar Tema
            </Text>
          </TouchableOpacity>

          <Text style={[styles.homeVersion, { color: theme.textTertiary }]}>
            v1.0 • Desenvolvido por Johannes Rosa
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Notes App
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} {...panResponder.panHandlers}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>📒 Bloco de Notas</Text>
          <Text style={styles.subtitle}>{notes.length} {notes.length === 1 ? 'nota' : 'notas'}</Text>
        </View>
        <View style={styles.menuButton} />
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.cardBackground, borderColor: theme.border, color: theme.text }]}
          placeholder="🔍 Buscar notas..."
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterChip, { backgroundColor: theme.cardBackground, borderColor: theme.border }, filterCategory === 'Todas' && styles.filterChipActive]}
            onPress={() => setFilterCategory('Todas')}
          >
            <Text style={[styles.filterText, { color: theme.textSecondary }, filterCategory === 'Todas' && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat}
              style={[styles.filterChip, { backgroundColor: theme.cardBackground, borderColor: theme.border }, filterCategory === cat && styles.filterChipActive]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text style={[styles.filterText, { color: theme.textSecondary }, filterCategory === cat && styles.filterTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notes List */}
      <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
        {sortedNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.textTertiary }]}>
              {searchQuery || filterCategory !== 'Todas' 
                ? '🔍 Nenhuma nota encontrada' 
                : '📝 Nenhuma nota ainda.\nToque no + para criar!'}
            </Text>
          </View>
        ) : (
          sortedNotes.map((note) => (
            <TouchableOpacity 
              key={note.id} 
              style={[styles.noteCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => openEditModal(note)}
            >
              <View style={styles.noteHeader}>
                <Text style={[styles.noteTitle, { color: theme.text }]}>{note.title}</Text>
                <TouchableOpacity onPress={() => deleteNote(note.id)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.noteContent, { color: theme.textSecondary }]} numberOfLines={3}>
                {note.content}
              </Text>
              <View style={[styles.noteFooter, { borderTopColor: theme.border }]}>
                <Text style={styles.noteCategory}>{note.category}</Text>
                <Text style={[styles.noteDate, { color: theme.textTertiary }]}>{formatDate(note.updatedAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal for Create/Edit */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingNote ? '✏️ Editar Nota' : '➕ Nova Nota'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={[styles.closeButton, { color: theme.textTertiary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
              placeholder="Título da nota"
              placeholderTextColor={theme.textTertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
            <Text style={[styles.charCount, { color: theme.textTertiary }]}>{title.length}/50</Text>

            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
              placeholder="Conteúdo da nota..."
              placeholderTextColor={theme.textTertiary}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: theme.textTertiary }]}>{content.length}/500</Text>

            <Text style={[styles.categoryLabel, { color: theme.text }]}>Categoria:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={editingNote ? updateNote : createNote}
            >
              <Text style={styles.saveButtonText}>
                {editingNote ? '💾 Salvar Alterações' : '➕ Criar Nota'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Side Drawer */}
      {drawerVisible && (
        <Animated.View 
          style={[
            styles.drawerOverlay,
            { opacity: overlayAnimation, backgroundColor: theme.overlayBackground }
          ]}
        >
          <TouchableOpacity 
            style={styles.drawerOverlayTouch} 
            activeOpacity={1} 
            onPress={closeDrawer}
          />
          <Animated.View 
            style={[
              styles.drawerContent,
              { 
                backgroundColor: theme.cardBackground,
                transform: [{ translateX: drawerAnimation }],
                shadowOpacity: overlayAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              }
            ]}
            {...panResponder.panHandlers}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              <View style={[styles.drawerHeader, { backgroundColor: theme.headerBackground }]}>
                <Text style={styles.drawerTitle}>⚙️ Painel de Controle</Text>
                <TouchableOpacity 
                  onPress={closeDrawer}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.drawerCloseButton}
                >
                  <Text style={styles.drawerClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Statistics Section */}
              <View style={[styles.drawerSection, { borderBottomColor: theme.border }]}>
                <Text style={[styles.drawerSectionTitle, { color: theme.text }]}>📊 Estatísticas</Text>
                <View style={[styles.statCard, { backgroundColor: theme.inputBackground }]}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total de Notas</Text>
                  <Text style={styles.statValue}>{stats.totalNotes}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.inputBackground }]}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total de Caracteres</Text>
                  <Text style={styles.statValue}>{stats.totalChars.toLocaleString()}</Text>
                </View>
                
                <Text style={[styles.statSubtitle, { color: theme.textSecondary }]}>Por Categoria:</Text>
                {stats.categoryStats.map((stat, index) => (
                  <View key={index} style={styles.categoryStatRow}>
                    <Text style={[styles.categoryStatLabel, { color: theme.textSecondary }]}>{stat.category}</Text>
                    <Text style={styles.categoryStatValue}>{stat.count}</Text>
                  </View>
                ))}
              </View>

              {/* Sort Options */}
              <View style={[styles.drawerSection, { borderBottomColor: theme.border }]}>
                <Text style={[styles.drawerSectionTitle, { color: theme.text }]}>🔄 Ordenar Por</Text>
                <TouchableOpacity 
                  style={[styles.sortOption, { backgroundColor: theme.inputBackground, borderColor: theme.border }, sortBy === 'recent' && styles.sortOptionActive]}
                  onPress={() => { setSortBy('recent'); closeDrawer(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sortOptionText, { color: theme.textSecondary }, sortBy === 'recent' && styles.sortOptionTextActive]}>
                    ⏰ Mais Recentes
                  </Text>
                  {sortBy === 'recent' && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sortOption, { backgroundColor: theme.inputBackground, borderColor: theme.border }, sortBy === 'oldest' && styles.sortOptionActive]}
                  onPress={() => { setSortBy('oldest'); closeDrawer(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sortOptionText, { color: theme.textSecondary }, sortBy === 'oldest' && styles.sortOptionTextActive]}>
                    🕐 Mais Antigas
                  </Text>
                  {sortBy === 'oldest' && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sortOption, { backgroundColor: theme.inputBackground, borderColor: theme.border }, sortBy === 'alphabetical' && styles.sortOptionActive]}
                  onPress={() => { setSortBy('alphabetical'); closeDrawer(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sortOptionText, { color: theme.textSecondary }, sortBy === 'alphabetical' && styles.sortOptionTextActive]}>
                    🔤 Alfabética
                  </Text>
                  {sortBy === 'alphabetical' && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sortOption, { backgroundColor: theme.inputBackground, borderColor: theme.border }, sortBy === 'category' && styles.sortOptionActive]}
                  onPress={() => { setSortBy('category'); closeDrawer(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sortOptionText, { color: theme.textSecondary }, sortBy === 'category' && styles.sortOptionTextActive]}>
                    🏷️ Categoria
                  </Text>
                  {sortBy === 'category' && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              </View>

              {/* Settings Section */}
              <View style={[styles.drawerSection, { borderBottomColor: theme.border }]}>
                <Text style={[styles.drawerSectionTitle, { color: theme.text }]}>⚙️ Configurações</Text>
                <TouchableOpacity 
                  style={[styles.settingRow, { backgroundColor: theme.inputBackground }]}
                  onPress={() => setIsDarkMode(!isDarkMode)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    {isDarkMode ? '🌙' : '☀️'} Modo {isDarkMode ? 'Escuro' : 'Claro'}
                  </Text>
                  <View style={[styles.toggle, isDarkMode && styles.toggleActive]}>
                    <View style={[styles.toggleCircle, isDarkMode && styles.toggleCircleActive]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Actions Section */}
              <View style={[styles.drawerSection, { borderBottomColor: theme.border }]}>
                <Text style={[styles.drawerSectionTitle, { color: theme.text }]}>🎯 Ações</Text>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={clearAllNotes}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>🗑️ Limpar Todas as Notas</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={() => {
                    Alert.alert('Exportar', 'Funcionalidade de exportação em desenvolvimento!');
                    closeDrawer();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>📤 Exportar Notas</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.drawerFooter}>
                <Text style={[styles.drawerFooterText, { color: theme.textTertiary }]}>Bloco de Notas v1.0</Text>
                <Text style={[styles.drawerFooterText, { color: theme.textTertiary }]}>Desenvolvido por Johannes Rosa</Text>
                <Text style={styles.drawerFooterHint}>👈 Deslize para fechar</Text>
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Home Page Styles
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  homeContent: {
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
  },
  homeIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  homeTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  homeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  homeFeatures: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 40,
    width: '100%',
  },
  featureCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  homeButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  homeThemeToggle: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  homeThemeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  homeVersion: {
    fontSize: 12,
    marginTop: 10,
  },
  
  // Notes App Styles
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  notesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 28,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  deleteIcon: {
    fontSize: 20,
    padding: 4,
  },
  noteContent: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  noteCategory: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },
  noteDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6366f1',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 28,
    color: '#9ca3af',
    fontWeight: '300',
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 4,
  },
  modalTextArea: {
    minHeight: 150,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  // Drawer Styles
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  drawerOverlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  drawerHeader: {
    backgroundColor: '#6366f1',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  drawerCloseButton: {
    padding: 5,
  },
  drawerClose: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  drawerSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  drawerSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 8,
  },
  categoryStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  categoryStatLabel: {
    fontSize: 13,
    color: '#4b5563',
  },
  categoryStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  sortOption: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortOptionActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  checkMark: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  toggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#d1d5db',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#6366f1',
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonSecondary: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  drawerFooter: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  drawerFooterText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  drawerFooterHint: {
    fontSize: 11,
    color: '#6366f1',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
