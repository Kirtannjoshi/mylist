import * as React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import FlightIcon from '@mui/icons-material/Flight';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PopcornMovieIcon from './components/icons/PopcornMovieIcon';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import BookIcon from '@mui/icons-material/Book';
import ListBoard from './components/ListBoard';
import MediaDetailDialog from './components/MediaDetailDialog';
import TaskList from './components/TaskList';
import RetroLogo from './components/RetroLogo';
import TravelLocationSearch from './components/TravelLocationSearch';
import TravelList from './components/TravelList';
import HomePage from './components/HomePage';
import EntertainmentPage from './components/EntertainmentPage';
import MovieDetailPage from './components/MovieDetailPage';
import SearchResultsPage from './components/SearchResultsPage';
import ProfilePage from './components/ProfilePage';
import { SongsComingSoon, BooksComingSoon } from './components/ComingSoonPage';
import UniversalSearchBar from './components/UniversalSearchBar';
import { useAuth } from './contexts/AuthContext';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const drawerWidthOpen = 260;
const drawerWidthClosed = 72;

const listItems = [
  { key: 'home', text: 'Home', icon: <AutoAwesomeIcon /> },
  { key: 'todo', text: 'To-Do List', icon: <CheckCircleIcon /> },
  { key: 'bucket', text: 'Bucket List', icon: <StarIcon /> },
  { key: 'travel', text: 'Travel List', icon: <FlightIcon /> },
  { key: 'media', text: 'Entertainment', icon: <PopcornMovieIcon /> },
  { key: 'music', text: 'Songs', icon: <MusicNoteIcon /> },
  { key: 'books', text: 'Books', icon: <BookIcon /> },
  { key: 'profile', text: 'Profile', icon: <AccountCircleIcon /> }
];

function SortableItem({ children, id }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ setNodeRef, style: {}, attributes, listeners })}
    </div>
  );
}

export default function AppContent() {
  const { userData, setUserData } = useAuth();
  const [active, setActive] = React.useState('home');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sidebarExpanded, setSidebarExpanded] = React.useState(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Use userData from auth context instead of local state
  const data = userData || {
    todo: [],
    bucket: [],
    travel: [],
    media: [],
    music: [],
    books: [],
  };

  const [statusFilter, setStatusFilter] = React.useState('all');
  const [visibleCount, setVisibleCount] = React.useState(24);

  const handleAdd = () => {
    const title = prompt('New item title');
    if (!title) return;
    const newData = { ...data, [active]: [{ title }, ...data[active]] };
    setUserData(newData);
  };

  const updateData = (newData) => {
    setUserData(newData);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
          {!isDesktop && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <RetroLogo collapsed={false} />
          
          {/* Universal Search Bar */}
          <Box sx={{ 
            maxWidth: isDesktop ? 400 : 200, 
            flexGrow: 1,
            ml: !isDesktop ? 1 : 0 
          }}>
            <UniversalSearchBar 
                onAdd={(item) => {
                  // Add to media list if not exists
                  const exists = data.media.some(m => 
                    (m.imdbID && m.imdbID === item.imdbID) || 
                    (m.title === item.title && m.year === item.year)
                  );
                  if (!exists) {
                    updateData({ ...data, media: [{ ...item, status: 'thinking-to-watch' }, ...data.media] });
                    return { success: true };
                  }
                  return { success: false, message: 'Already in your list!' };
                }}
                onOpenDetail={(id) => window.open(`#/movie/${id}`, '_blank')}
                placeholder="Quick search..."
                compact={true}
                sx={{ 
                  '& .MuiTextField-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiOutlinedInput-root': {
                      color: 'text.primary',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      opacity: 1,
                    },
                  }
                }}
              />
            </Box>
          
          <Box sx={{ flex: isDesktop ? 0 : 1 }} />
          <Typography variant="body2" color="text.secondary">
            {listItems.find(l=>l.key===active)?.text}
          </Typography>
        </Toolbar>
      </AppBar>

      {isDesktop ? (
        <Drawer
          variant="permanent"
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
          sx={{
            width: sidebarExpanded ? drawerWidthOpen : drawerWidthClosed,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: sidebarExpanded ? drawerWidthOpen : drawerWidthClosed,
              transition: 'width 200ms ease',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <Box sx={{ p: 1 }}>
            <RetroLogo collapsed={!sidebarExpanded} />
          </Box>
          <Divider />
          <List sx={{ pt: 0 }}>
            {listItems.map((item) => (
              <ListItem key={item.key} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  selected={active === item.key}
                  onClick={() => setActive(item.key)}
                  sx={{
                    minHeight: 48,
                    justifyContent: sidebarExpanded ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: sidebarExpanded ? 2 : 'auto', justifyContent: 'center' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: sidebarExpanded ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: { boxSizing: 'border-box', width: drawerWidthOpen, bgcolor: 'background.paper' },
          }}
        >
          <Box sx={{ p: 1 }}>
            <RetroLogo collapsed={false} />
          </Box>
          <Divider />
          <List>
            {listItems.map((item) => (
              <ListItem key={item.key} disablePadding>
                <ListItemButton selected={active === item.key} onClick={() => { setActive(item.key); setMobileOpen(false); }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, mb: !isDesktop ? 7 : 0 }}>
        <Routes>
          <Route path="/" element={
            <>
              {active !== 'home' && (
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                  {listItems.find(l => l.key === active)?.text}
                </Typography>
              )}
              {active === 'home' ? (
                <HomePage 
                  savedMedia={data.media}
                  onOpenDetail={(id) => window.open(`#/movie/${id}`, '_blank')}
                  onAddToLibrary={(item) => {
                    // Check if movie already exists
                    const exists = data.media.some(m => 
                      (m.imdbID && m.imdbID === item.imdbID) || 
                      (m.title === item.title && m.year === item.year)
                    );
                    if (!exists) {
                      updateData({ ...data, media: [{ ...item, status: 'thinking-to-watch' }, ...data.media] });
                    }
                  }}
                />
              ) : active === 'media' ? (
                <EntertainmentPage
                  savedMedia={data.media}
                  statusFilter={statusFilter}
                  onFilterChange={setStatusFilter}
                  onAdd={(item) => {
                    // Check if movie already exists
                    const exists = data.media.some(m => 
                      (m.imdbID && m.imdbID === item.imdbID) || 
                      (m.title === item.title && m.year === item.year)
                    );
                    if (!exists) {
                      updateData({ ...data, media: [{ ...item, status: 'thinking-to-watch' }, ...data.media] });
                    }
                  }}
                  onRemove={(idKey) => updateData({ ...data, media: data.media.filter((x) => (x.imdbID||x.title) !== idKey) })}
                  onUpdateStatus={(idKey, status) => updateData({
                    ...data,
                    media: data.media.map((x) => ( (x.imdbID||x.title) === idKey ? { ...x, status } : x )),
                  })}
                  onOpenDetail={(id) => window.open(`#/movie/${id}`, '_blank')}
                  visibleCount={visibleCount}
                  onShowMore={() => setVisibleCount((c) => c + 24)}
                  SortableItem={SortableItem}
                />
              ) : active === 'travel' ? (
                <Box>
                  <TravelLocationSearch onAdd={(location) => updateData({ ...data, travel: [location, ...data.travel] })} />
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>My Travel List</Typography>
                    <TravelList 
                      locations={data.travel}
                      onToggleVisited={(id) => updateData({ 
                        ...data, 
                        travel: data.travel.map(loc => loc.id === id ? { ...loc, visited: !loc.visited } : loc) 
                      })}
                      onRemove={(id) => updateData({ ...data, travel: data.travel.filter(loc => loc.id !== id) })}
                    />
                  </Box>
                </Box>
              ) : active === 'music' ? (
                <SongsComingSoon />
              ) : active === 'books' ? (
                <BooksComingSoon />
              ) : active === 'profile' ? (
                <ProfilePage />
              ) : active === 'todo' ? (
                <TaskList
                  title="To-Do"
                  items={data.todo}
                  onAdd={(text) => updateData({ ...data, todo: [{ id: 't'+Date.now(), text, done: false }, ...data.todo] })}
                  onToggle={(id) => updateData({ ...data, todo: data.todo.map((t) => t.id===id ? { ...t, done: !t.done } : t) })}
                  onRemove={(id) => updateData({ ...data, todo: data.todo.filter((t) => t.id !== id) })}
                />
              ) : active === 'bucket' ? (
                <TaskList
                  title="Bucket List"
                  items={data.bucket}
                  onAdd={(text) => updateData({ ...data, bucket: [{ id: 'b'+Date.now(), text, done: false }, ...data.bucket] })}
                  onToggle={(id) => updateData({ ...data, bucket: data.bucket.map((t) => t.id===id ? { ...t, done: !t.done } : t) })}
                  onRemove={(id) => updateData({ ...data, bucket: data.bucket.filter((t) => t.id !== id) })}
                />
              ) : (
                <ListBoard title="Items" items={data[active]} onAdd={handleAdd} />
              )}
            </>
          } />
          <Route path="/media/:imdbID" element={<MediaDetailsPage />} />
          <Route path="/search" element={
            <SearchResultsPage 
              userData={data}
              onAddMovie={(item) => {
                // Check if movie already exists
                const exists = data.media.some(m => 
                  (m.imdbID && m.imdbID === item.imdbID) || 
                  (m.title === item.title && m.year === item.year)
                );
                if (!exists) {
                  updateData({ ...data, media: [item, ...data.media] });
                  return { success: true };
                }
                return { success: false, message: 'Already in your list!' };
              }}
              onAddTodo={(text) => updateData({ ...data, todo: [{ id: 't'+Date.now(), text, done: false }, ...data.todo] })}
              onAddBucket={(text) => updateData({ ...data, bucket: [{ id: 'b'+Date.now(), text, done: false }, ...data.bucket] })}
            />
          } />
          <Route path="/movie/:imdbID" element={
            <MovieDetailPage 
              savedMedia={data.media}
              onAddToLibrary={(item) => {
                // Check if movie already exists
                const exists = data.media.some(m => 
                  (m.imdbID && m.imdbID === item.imdbID) || 
                  (m.title === item.title && m.year === item.year)
                );
                if (!exists) {
                  updateData({ ...data, media: [item, ...data.media] });
                }
              }}
              onUpdateStatus={(imdbID, status) => updateData({
                ...data,
                media: data.media.map((x) => x.imdbID === imdbID ? { ...x, status } : x)
              })}
            />
          } />
        </Routes>
        {(!isDesktop) && (
          <BottomNavigation
            showLabels
            value={listItems.findIndex((l) => l.key === active)}
            onChange={(_, idx) => setActive(listItems[idx].key)}
            sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            {listItems.map((l) => (
              <BottomNavigationAction key={l.key} label={l.text.split(' ')[0]} icon={l.icon} />
            ))}
          </BottomNavigation>
        )}
      </Box>
    </Box>
  );
}

function MediaDetailsPage() {
  const { imdbID } = useParams();
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();
  return (
    <MediaDetailDialog open={open} imdbID={imdbID} onClose={() => { setOpen(false); navigate('/'); }} />
  );
}
