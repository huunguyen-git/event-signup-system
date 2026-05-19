import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  Entypo,
} from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
  Linking,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { EventService } from "@/axios/eventService";
import { CommentService } from "@/axios/commentService";
import { getToken, getUserId } from "@/services/storage";

interface IUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface IComment {
  id: string;
  event_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string | Date;
  user?: IUser;
}

const CommentItem = ({
  comment,
  allReplies,
  themeColor,
  hostId,
  isHost,
  previewMode,
  onReplyClick,
  onViewRepliesInModal,
  onPinClick,
  rootId,
  commentMap,
  replyingToName
}: {
  comment: IComment;
  allReplies: IComment[];
  themeColor: string;
  hostId: string;
  isHost: boolean;
  previewMode: boolean;
  onReplyClick: (parentId: string, userName: string) => void;
  onViewRepliesInModal?: () => void;
  onPinClick: (comment: IComment) => void;
  rootId?: string;
  commentMap?: Map<string, IComment>;
  replyingToName?: string | null;
}) => {

  const [showReplies, setShowReplies] = useState(false);

  const timeAgo = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
  };

  const displayedReplies = previewMode ? [] : (showReplies ? allReplies : []);

  const latestHostReply = useMemo(() => {
    if (!previewMode || allReplies.length === 0) return null;
    const hostReplies = allReplies.filter(r => r.user_id === hostId);
    if (hostReplies.length === 0) return null;
    return hostReplies.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }, [allReplies, hostId, previewMode]);

  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentMain}>
        {comment.user?.avatar_url ? (
          <Image source={{ uri: comment.user.avatar_url }} style={styles.commentAvatar} />
        ) : (
          <View style={[styles.commentAvatar, { backgroundColor: '#e1e4e8', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="person" size={18} color="#a3a6ac" />
          </View>
        )}

        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <CustomText style={styles.commentUserName}>
              {comment.user?.full_name || "User"}
              {comment.user_id === hostId && <CustomText style={{color: themeColor, fontSize: 11}}> (Host)</CustomText>}
            </CustomText>

            {/* 🟢 TIKTOK STYLE: HIỆN TAM GIÁC VÀ TÊN NGƯỜI ĐƯỢC REPLY NẾU LÀ NESTED REPLY */}
            {replyingToName && (
              <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 8}}>
                <Entypo name="triangle-right" size={14} color="#888" style={{marginLeft: -2, marginRight: 2}} />
                <CustomText style={{fontSize: 12, fontWeight: 'bold', color: '#666'}}>{replyingToName}</CustomText>
              </View>
            )}

            {comment.is_pinned && (
              <View style={[styles.pinnedBadge, { backgroundColor: themeColor + '20' }]}>
                <Entypo name="pin" size={10} color={themeColor} />
                <CustomText style={[styles.pinnedText, { color: themeColor }]}>Pinned</CustomText>
              </View>
            )}
            <CustomText style={styles.commentTime}>{timeAgo(comment.created_at)}</CustomText>
          </View>
          <CustomText style={styles.commentContent}>{comment.content}</CustomText>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => onReplyClick(comment.id, comment.user?.full_name || "User")}>
              <CustomText style={[styles.actionBtnText, { color: themeColor }]}>Reply</CustomText>
            </TouchableOpacity>

            {isHost && !comment.parent_id && (
              <TouchableOpacity style={[styles.actionBtn, { marginLeft: 15 }]} onPress={() => onPinClick(comment)}>
                <Entypo name="pin" size={12} color={comment.is_pinned ? themeColor : '#777'} style={{marginRight: 4}} />
                <CustomText style={[styles.actionBtnText, { color: comment.is_pinned ? themeColor : '#777', fontWeight: comment.is_pinned ? 'bold' : 'normal' }]}>
                  {comment.is_pinned ? "Unpin" : "Pin"}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {previewMode && latestHostReply && (
        <View style={styles.repliesList}>
          <CommentItem
            comment={latestHostReply}
            allReplies={[]}
            themeColor={themeColor}
            hostId={hostId}
            isHost={isHost}
            previewMode={true}
            onReplyClick={onReplyClick}
            onPinClick={onPinClick}
            rootId={rootId || comment.id}
            commentMap={commentMap}
            replyingToName={
              (latestHostReply.parent_id !== (rootId || comment.id) && latestHostReply.parent_id !== null)
              ? commentMap?.get(latestHostReply.parent_id)?.user?.full_name
              : null
            }
          />
        </View>
      )}

      {!previewMode && displayedReplies.length > 0 && (
        <View style={styles.repliesList}>
          {displayedReplies.map(reply => {
            const rId = rootId || comment.id;
            const isNested = reply.parent_id !== rId && reply.parent_id !== null;
            const rName = isNested ? commentMap?.get(reply.parent_id)?.user?.full_name : null;

            return (
              <CommentItem
                key={reply.id}
                comment={reply}
                allReplies={[]}
                themeColor={themeColor}
                hostId={hostId}
                isHost={isHost}
                previewMode={false}
                onReplyClick={onReplyClick}
                onPinClick={onPinClick}
                rootId={rId}
                commentMap={commentMap}
                replyingToName={rName}
              />
            );
          })}
        </View>
      )}

      {!previewMode && allReplies.length > 0 && (
        <TouchableOpacity style={styles.viewMoreRepliesBtn} onPress={() => setShowReplies(!showReplies)}>
          <View style={styles.viewMoreDash} />
          <CustomText style={styles.viewMoreRepliesText}>
            {showReplies ? "Hide replies" : `View all ${allReplies.length} replies`}
          </CustomText>
        </TouchableOpacity>
      )}

      {previewMode && allReplies.length > (latestHostReply ? 1 : 0) && (
        <TouchableOpacity style={styles.viewMoreRepliesBtn} onPress={onViewRepliesInModal}>
          <View style={styles.viewMoreDash} />
          <CustomText style={[styles.viewMoreRepliesText, { color: themeColor }]}>
            {latestHostReply
              ? `View all ${allReplies.length} replies`
              : `View ${allReplies.length} ${allReplies.length > 1 ? 'replies' : 'reply'}`}
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function EventDetailsScreen() {
  const router = useRouter();
  const themeColor = Colors.light.tint;

  const { id } = useLocalSearchParams();
  const [eventData, setEventData] = useState<any | null>(null);
  const [datePart, setDatePart] = useState("");
  const [timePart, setTimePart] = useState("");

  const [comments, setComments] = useState<IComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);

  const [showAllCommentsModal, setShowAllCommentsModal] = useState(false);
  const commentInputRef = useRef<TextInput>(null);
  const modalInputRef = useRef<TextInput>(null);

  const fetchComments = async () => {
    try {
      const commentData = await CommentService.getCommentsByEvent(id as string);
      setComments(commentData || []);
    } catch (error) {
      setComments([]);
    }
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const savedUserId = await getUserId();
          if (savedUserId) {
            setCurrentUserId(savedUserId);
          }

          const data = await EventService.getEvent(id as string);
          setEventData(data);

          const eventdate = new Date(data.event_date);
          const date = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(eventdate);
          const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(eventdate);

          setDatePart(date);
          setTimePart(time);

          await fetchComments();
          setLoadingComments(false);
        } catch (error) {
          console.error("Error fetching event details:", error);
          setLoadingComments(false);
        }
      };
      fetchData();
    }
  }, [id]);

  const organizedComments = useMemo(() => {
    const sorted = [...comments].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const roots: IComment[] = [];
    const repliesMap = new Map<string, IComment[]>();
    const commentMap = new Map<string, IComment>();

    sorted.forEach(comment => {
      commentMap.set(comment.id, comment);
      if (comment.parent_id === null) {
        roots.push(comment);
      } else {
        if (!repliesMap.has(comment.parent_id)) {
          repliesMap.set(comment.parent_id, []);
        }
        repliesMap.get(comment.parent_id)?.push(comment);
      }
    });

    // 🟢 LÀM PHẲNG CÂY REPLY ĐỂ TẠO STYLE TIKTOK
    const flatRepliesMap = new Map<string, IComment[]>();

    roots.forEach(root => {
      const getDescendants = (parentId: string): IComment[] => {
        const children = repliesMap.get(parentId) || [];
        let descendants: IComment[] = [];
        children.forEach(child => {
          descendants.push(child);
          descendants = descendants.concat(getDescendants(child.id));
        });
        return descendants;
      };

      const allDescendants = getDescendants(root.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      flatRepliesMap.set(root.id, allDescendants);
    });

    return { roots, flatRepliesMap, commentMap };
  }, [comments]);

  const handleOpenMap = () => {
    if (!eventData?.location_url) return;
    const encodedLocation = encodeURIComponent(eventData.location_url);
    const url = Platform.select({ ios: `maps://0,0?q=${encodedLocation}`, android: `geo:0,0?q=${encodedLocation}` });
    if (url) Linking.openURL(url);
  };

  const handleShare = () => {
    router.push({ pathname: "/ShowQrScreen", params: { id: eventData?.id, title: eventData?.title } });
  };

  const handleRegister = () => {
    router.push({
      pathname: "/RegistrationFormScreen",
      params: {
        id: eventData?.id,
        isCreate: "false",
      },
    });
  };

  const handleReplyClick = (parentId: string, userName: string) => {
    setReplyingTo({ id: parentId, name: userName });
    setTimeout(() => {
      if (showAllCommentsModal) {
        modalInputRef.current?.focus();
      } else {
        commentInputRef.current?.focus();
      }
    }, 200);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    const textToSend = newComment;
    const currentReply = replyingTo;
    setNewComment("");
    setReplyingTo(null);

    try {
      const token = await getToken();
      if (!token) return;

      await CommentService.postComment(token, id as string, textToSend, currentReply ? currentReply.id : null);
      await fetchComments();
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
    }
  };

  // 🟢 FIX LỖI GHIM ĐỘC TÔN (CHỈ 1 COMMENT ĐƯỢC GHIM)
  const handlePinAction = async (comment: IComment) => {
    try {
      const token = await getToken();
      if (!token) return;

      if (!comment.is_pinned) {
        const currentPinned = comments.find(c => c.is_pinned);
        if (currentPinned && currentPinned.id !== comment.id) {
          await CommentService.pinComment(token, currentPinned.id);
        }
      }

      await CommentService.pinComment(token, comment.id);
      await fetchComments();
    } catch (apiError: any) {
      console.error("Lỗi ghim:", apiError);
    }
  };

  const eventHostId = eventData?.host?.id || eventData?.host_id || "";
  const isUserHost = currentUserId !== null && eventHostId !== "" && currentUserId === eventHostId;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: "white" }} edges={["top"]} />
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View style={[styles.blueHeader, { backgroundColor: themeColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <FontAwesome5
            name="building"
            size={20}
            color="white"
            style={{ marginLeft: 15 }}
          />
          <CustomText variant="bold" style={styles.headerTitle}>EVENT CONNECT</CustomText>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="white" />
          <CustomText style={styles.shareBtnText}>Share</CustomText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Image source={eventData?.banner_url ? { uri: eventData.banner_url } : require("../assets/images/icon.png")} style={styles.banner} />
          <View style={styles.content}>
          <CustomText variant="bold" style={[styles.mainTitle, { color: themeColor }]}>
            {eventData?.title}
          </CustomText>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar-month" size={28} color={themeColor} />
            <View style={styles.infoTextGroup}>
              <CustomText variant="bold" style={styles.infoLabel}>Event Timeline (Time & Date)</CustomText>
              <CustomText style={styles.infoValue}>
                {datePart} - {timePart}
              </CustomText>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-sharp" size={28} color={themeColor} />
            <View style={styles.infoTextGroup}>
              <CustomText variant="bold" style={styles.infoLabel}>Location</CustomText>
              <CustomText style={styles.infoValue}>
                {eventData?.location_url}
              </CustomText>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <View style={[styles.mapFrame, { backgroundColor: "#f5f5f5" }]} />
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleOpenMap}
              activeOpacity={0.7}
            >
              <Ionicons name="map-outline" size={16} color="#007AFF" />
              <CustomText variant="bold" style={styles.mapButtonText}>Open in Maps</CustomText>
            </TouchableOpacity>
            <View style={styles.mapPin}>
              <Ionicons name="location" size={36} color="red" />
            </View>
          {eventData?.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="information-circle" size={24} color={themeColor} />
                <CustomText style={styles.sectionTitle}>About the Event</CustomText>
              </View>
              <CustomText style={styles.bodyText}>{eventData.description}</CustomText>
            </View>
          )}

          {(eventData?.host || eventData?.host_id) && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="person" size={20} color={themeColor} />
                <CustomText style={styles.sectionTitle}>Host/Organization</CustomText>
              </View>
              <TouchableOpacity
                style={styles.hostCard}
                activeOpacity={0.7}
                onPress={() => {
                  const targetId = eventData?.host?.id || eventData?.host_id;
                  if (targetId) {
                    router.push({
                      pathname: "/OrganizerProfileScreen",
                      params: {
                        userId: targetId,
                        full_name: eventData?.host?.full_name || "",
                        avatar_url: eventData?.host?.avatar_url || "",
                        email: eventData?.host?.email || "",
                        phone_number: eventData?.host?.phone_number || "",
                        birthdate: eventData?.host?.birthdate || "",
                        created_at: eventData?.host?.created_at || "",
                      }
                    });
                  }
                }}
              >
                {eventData?.host?.avatar_url ? (
                  <Image source={{ uri: eventData.host.avatar_url }} style={styles.hostAvatar} />
                ) : (
                  <View style={[styles.hostAvatar, { backgroundColor: '#e1e4e8', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="person" size={24} color="#a3a6ac" />
                  </View>
                )}
                <View>
                    <CustomText style={styles.hostName}>{eventData?.host?.full_name ? eventData.host.full_name : "Event Organizer"}</CustomText>
                    <CustomText style={styles.hostSubText}>Host</CustomText>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.section, {marginBottom: 20}]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons
                name="information-circle"
                size={24}
                color={themeColor}
              />
              <CustomText style={styles.sectionTitle}>Comments ({comments.length})</CustomText>
            </View>

            {loadingComments && (
              <ActivityIndicator size="small" color={themeColor} style={{marginTop: 20}} />
            )}

            {!loadingComments && organizedComments.roots.length > 0 && (
              <View style={[styles.commentList, { marginTop: 15 }]}>
                {organizedComments.roots.slice(0, 3).map(comment => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    allReplies={organizedComments.flatRepliesMap.get(comment.id) || []}
                    themeColor={themeColor}
                    hostId={eventHostId}
                    isHost={isUserHost}
                    previewMode={true}
                    onReplyClick={handleReplyClick}
                    onPinClick={handlePinAction}
                    rootId={comment.id}
                    commentMap={organizedComments.commentMap}
                    onViewRepliesInModal={() => setShowAllCommentsModal(true)}
                  />
                ))}
              </View>
            )}

            {!loadingComments && organizedComments.roots.length > 3 && (
              <TouchableOpacity style={[styles.viewAllCommentsBtn, { marginBottom: 15 }]} onPress={() => setShowAllCommentsModal(true)}>
                <CustomText style={styles.viewAllCommentsText}>View all {comments.length} comments</CustomText>
              </TouchableOpacity>
            )}

            <View style={{marginTop: 5, marginBottom: 10}}>
              {replyingTo && (
                <View style={styles.replyingToHeader}>
                  <CustomText style={styles.replyingToText}>Replying to <CustomText style={{fontWeight: 'bold'}}>{replyingTo.name}</CustomText></CustomText>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Ionicons name="close-circle" size={16} color="#888" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.commentInputRow}>
                <TextInput ref={commentInputRef} style={styles.commentInput} placeholder="Add a public comment..." value={newComment} onChangeText={setNewComment} multiline />
                <TouchableOpacity style={[styles.postCommentBtn, {backgroundColor: newComment.trim() ? themeColor : '#ccc'}]} disabled={!newComment.trim()} onPress={handleSendComment} >
                  <Ionicons name="send" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showAllCommentsModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => {setShowAllCommentsModal(false); setReplyingTo(null);}}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{width: 30}}/>
            <CustomText style={styles.modalTitle}>Comments ({comments.length})</CustomText>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => {setShowAllCommentsModal(false); setReplyingTo(null);}}>
              <Ionicons name="close" size={26} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{flex: 1, paddingHorizontal: 20, paddingTop: 10}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {organizedComments.roots.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                allReplies={organizedComments.flatRepliesMap.get(comment.id) || []}
                themeColor={themeColor}
                hostId={eventHostId}
                isHost={isUserHost}
                previewMode={false}
                onReplyClick={handleReplyClick}
                onPinClick={handlePinAction}
                rootId={comment.id}
                commentMap={organizedComments.commentMap}
              />
            ))}
            <View style={{height: 40}}/>
          </ScrollView>

          <View style={[styles.footer, { position: 'relative', borderTopWidth: 1, borderColor: '#eee', paddingHorizontal: 15, paddingVertical: 10 }]}>
            {replyingTo && (
              <View style={[styles.replyingToHeader, { marginLeft: 0, marginBottom: 5 }]}>
                <CustomText style={styles.replyingToText}>Replying to <CustomText style={{fontWeight: 'bold'}}>{replyingTo.name}</CustomText></CustomText>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Ionicons name="close-circle" size={16} color="#888" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.commentInputRow}>
              <TextInput ref={modalInputRef} style={styles.commentInput} placeholder="Add a public comment..." value={newComment} onChangeText={setNewComment} multiline />
              <TouchableOpacity style={[styles.postCommentBtn, {backgroundColor: newComment.trim() ? themeColor : '#ccc'}]} disabled={!newComment.trim()} onPress={handleSendComment} >
                <Ionicons name="send" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.regBtn, { backgroundColor: themeColor }]}
          onPress={handleRegister}
        >
          <CustomText variant="bold" style={styles.regBtnText}>REGISTER NOW</CustomText>
        </TouchableOpacity>
      </View>
    </View>
    )};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  blueHeader: { height: 60, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, zIndex: 100 },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
    letterSpacing: 1,
  },
  shareBtn: { flexDirection: "row", alignItems: "center" },
  shareBtnText: { color: "white", marginLeft: 5, fontSize: 14 },
  scrollBody: { paddingBottom: 110 },
  banner: { width: "100%", height: 200, resizeMode: "cover" },
  content: { padding: 20 },
  mainTitle: { fontSize: 22, marginBottom: 20 },
  infoRow: { flexDirection: "row", marginBottom: 15, alignItems: "center" },
  infoTextGroup: { marginLeft: 12, flex: 1 },
  infoLabel: { fontSize: 15, color: "#333" },
  infoValue: { color: "#666", marginTop: 3, fontSize: 13 },
  mapContainer: {
    width: "100%",
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 15,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    position: "relative",
  },
  mapFrame: { width: "100%", height: "100%" },
  mapButton: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 10,
  },
  mapButtonText: {
    color: "#007AFF",
    fontSize: 12,
    marginLeft: 5,
  },
  mapPin: { position: "absolute", top: "35%", left: "46%" },
  section: { marginTop: 25 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    marginLeft: 8,
    color: "#333",
  },
  bodyText: { color: "#666", lineHeight: 20, fontSize: 13 },
  hostName: {
    color: "#333",
    fontSize: 14,
    marginBottom: 5,
  },

  speakerList: { marginTop: 15 },
  speakerCard: { alignItems: "center", marginRight: 15, width: 90 },
  speakerImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#eee",
  },
  speakerName: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
  speakerRole: { fontSize: 10, color: "#888" },
  profileTag: {
    backgroundColor: "#E1E9F4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  profileTagText: { fontSize: 9 },

  sponsorList: { marginTop: 10, paddingVertical: 10 },
  sponsorCard: { marginRight: 25, justifyContent: "center" },
  sponsorImg: { width: 80, height: 40 },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  regBtn: { padding: 16, borderRadius: 30, alignItems: "center" },
  regBtnText: { color: "white", fontSize: 16 },
  capacityText: { color: "#666", fontSize: 13, marginTop: 5 },
  hostCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#eee' },
  hostAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  hostSubText: { color: '#888', fontSize: 12, marginTop: 2 },
  replyingToHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0f2f5', paddingHorizontal: 15, paddingVertical: 6, borderTopLeftRadius: 10, borderTopRightRadius: 10, alignSelf: 'flex-start', marginLeft: 5 },
  replyingToText: { fontSize: 12, color: '#555', marginRight: 10 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-start' },
  commentInput: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 10 : 8, fontSize: 13, maxHeight: 100, marginRight: 10 },
  postCommentBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  commentList: { marginTop: 5 },
  commentContainer: { marginBottom: 20 },
  commentMain: { flexDirection: 'row', alignItems: 'flex-start' },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  commentUserName: { fontWeight: 'bold', fontSize: 13, marginRight: 8, color: '#333' },
  commentTime: { fontSize: 11, color: '#aaa', marginLeft: 'auto' },
  commentContent: { fontSize: 13, color: '#444', lineHeight: 18 },
  actionButtonsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  actionBtnText: { fontSize: 12, fontWeight: '500' },
  pinnedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginRight: 5 },
  pinnedText: { fontSize: 9, fontWeight: 'bold', marginLeft: 3 },
  repliesList: { marginLeft: 48, marginTop: 12 },
  viewAllCommentsBtn: { alignSelf: 'center', marginTop: 10, paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#f0f2f5', borderRadius: 20 },
  viewAllCommentsText: { fontSize: 13, fontWeight: 'bold', color: '#555' },
  viewMoreRepliesBtn: { flexDirection: 'row', alignItems: 'center', marginLeft: 48, marginTop: 8 },
  viewMoreDash: { width: 24, height: 1, backgroundColor: '#aaa', marginRight: 8 },
  viewMoreRepliesText: { fontSize: 13, fontWeight: 'bold', color: '#666' },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  modalCloseBtn: { padding: 4 },
});
