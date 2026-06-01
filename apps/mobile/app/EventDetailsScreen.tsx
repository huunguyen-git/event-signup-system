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
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { EventService } from "@/axios/eventService";
import { CommentService } from "@/axios/commentService";
import { getToken, getUserId } from "@/services/storage";

import Header from "@/components/Header";
import NotificationBell from "@/components/NotificationBell";

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
  replyingToName,
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
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000,
    );
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
  };

  const displayedReplies = previewMode ? [] : showReplies ? allReplies : [];

  const latestHostReply = useMemo(() => {
    if (!previewMode || allReplies.length === 0) return null;
    const hostReplies = allReplies.filter((r) => r.user_id === hostId);
    if (hostReplies.length === 0) return null;
    return hostReplies.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
  }, [allReplies, hostId, previewMode]);

  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentMain}>
        {comment.user?.avatar_url ? (
          <Image
            source={{ uri: comment.user.avatar_url }}
            style={styles.commentAvatar}
          />
        ) : (
          <View
            style={[
              styles.commentAvatar,
              {
                backgroundColor: "#e1e4e8",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Ionicons name="person" size={18} color="#a3a6ac" />
          </View>
        )}

        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <CustomText variant="bold" style={styles.commentUserName}>
              {comment.user?.full_name || "User"}
              {comment.user_id === hostId && (
                <CustomText style={{ color: themeColor, fontSize: 11 }}>
                  {" "}
                  (Host)
                </CustomText>
              )}
            </CustomText>

            {replyingToName && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Entypo
                  name="triangle-right"
                  size={14}
                  color="#888"
                  style={{ marginLeft: -2, marginRight: 2 }}
                />
                <CustomText
                  variant="bold"
                  style={{ fontSize: 12, color: "#666" }}
                >
                  {replyingToName}
                </CustomText>
              </View>
            )}

            {comment.is_pinned && (
              <View
                style={[
                  styles.pinnedBadge,
                  { backgroundColor: themeColor + "20" },
                ]}
              >
                <Entypo name="pin" size={10} color={themeColor} />
                <CustomText
                  variant="bold"
                  style={[styles.pinnedText, { color: themeColor }]}
                >
                  Pinned
                </CustomText>
              </View>
            )}
            <CustomText style={styles.commentTime}>
              {timeAgo(comment.created_at)}
            </CustomText>
          </View>
          <CustomText style={styles.commentContent}>
            {comment.content}
          </CustomText>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                onReplyClick(comment.id, comment.user?.full_name || "User")
              }
            >
              <CustomText style={[styles.actionBtnText, { color: themeColor }]}>
                Reply
              </CustomText>
            </TouchableOpacity>

            {isHost && !comment.parent_id && (
              <TouchableOpacity
                style={[styles.actionBtn, { marginLeft: 15 }]}
                onPress={() => onPinClick(comment)}
              >
                <Entypo
                  name="pin"
                  size={12}
                  color={comment.is_pinned ? themeColor : "#777"}
                  style={{ marginRight: 4 }}
                />
                <CustomText
                  style={[
                    styles.actionBtnText,
                    {
                      color: comment.is_pinned ? themeColor : "#777",
                      fontWeight: comment.is_pinned ? "bold" : "normal",
                    },
                  ]}
                >
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
              latestHostReply.parent_id !== (rootId || comment.id) &&
              latestHostReply.parent_id !== null
                ? commentMap?.get(latestHostReply.parent_id)?.user?.full_name
                : null
            }
          />
        </View>
      )}

      {!previewMode && displayedReplies.length > 0 && (
        <View style={styles.repliesList}>
          {displayedReplies.map((reply) => {
            const rId = rootId || comment.id;
            const isNested =
              reply.parent_id !== rId && reply.parent_id !== null;
            const rName = isNested
              ? commentMap?.get(reply.parent_id as string)?.user?.full_name
              : null;

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
        <TouchableOpacity
          style={styles.viewMoreRepliesBtn}
          onPress={() => setShowReplies(!showReplies)}
        >
          <View style={styles.viewMoreDash} />
          <CustomText variant="bold" style={styles.viewMoreRepliesText}>
            {showReplies
              ? "Hide replies"
              : `View all ${allReplies.length} replies`}
          </CustomText>
        </TouchableOpacity>
      )}

      {previewMode && allReplies.length > (latestHostReply ? 1 : 0) && (
        <TouchableOpacity
          style={styles.viewMoreRepliesBtn}
          onPress={onViewRepliesInModal}
        >
          <View style={styles.viewMoreDash} />
          <CustomText
            variant="bold"
            style={[styles.viewMoreRepliesText, { color: themeColor }]}
          >
            {latestHostReply
              ? `View all ${allReplies.length} replies`
              : `View ${allReplies.length} ${allReplies.length > 1 ? "replies" : "reply"}`}
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function EventDetailsScreen() {
  const router = useRouter();
  const themeColor = Colors.light.tint;
  const EVENT_LOCATION_DEFAULT = "Trường Đại học Công nghệ Thông tin (UIT)";

  const { id, isRegistered } = useLocalSearchParams();
  const registered = isRegistered === "true";
  const [eventData, setEventData] = useState<any | null>(null);
  const [datePart, setDatePart] = useState("");
  const [timePart, setTimePart] = useState("");
  const [endDatePart, setEndDatePart] = useState("");
  const [endTimePart, setEndTimePart] = useState("");

  const [comments, setComments] = useState<IComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

          const formatD = (d: Date) =>
            new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(d);

          const formatT = (d: Date) =>
            new Intl.DateTimeFormat("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }).format(d);

          if (data.event_date) {
            const eventdate = new Date(data.event_date);
            setDatePart(formatD(eventdate));
            setTimePart(formatT(eventdate));
          }

          if (data.end_date) {
            const enddate = new Date(data.end_date);
            setEndDatePart(formatD(enddate));
            setEndTimePart(formatT(enddate));
          }

          await fetchComments();
          setLoadingComments(false);
        } catch (error) {
          console.log("Error fetching event details:", error);
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
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    const roots: IComment[] = [];
    const repliesMap = new Map<string, IComment[]>();
    const commentMap = new Map<string, IComment>();

    sorted.forEach((comment) => {
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

    const flatRepliesMap = new Map<string, IComment[]>();

    roots.forEach((root) => {
      const getDescendants = (parentId: string): IComment[] => {
        const children = repliesMap.get(parentId) || [];
        let descendants: IComment[] = [];
        children.forEach((child) => {
          descendants.push(child);
          descendants = descendants.concat(getDescendants(child.id));
        });
        return descendants;
      };

      const allDescendants = getDescendants(root.id).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      flatRepliesMap.set(root.id, allDescendants);
    });

    return { roots, flatRepliesMap, commentMap };
  }, [comments]);

  const handleShare = () => {
    router.push({
      pathname: "/ShowQrScreen",
      params: { id: eventData?.id, title: eventData?.title },
    });
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

      await CommentService.postComment(
        token,
        id as string,
        textToSend,
        currentReply ? currentReply.id : null,
      );
      await fetchComments();
    } catch (error) {
      console.log("Lỗi gửi bình luận:", error);
    }
  };

  const handlePinAction = async (comment: IComment) => {
    try {
      const token = await getToken();
      if (!token) return;

      if (!comment.is_pinned) {
        const currentPinned = comments.find((c) => c.is_pinned);
        if (currentPinned && currentPinned.id !== comment.id) {
          await CommentService.pinComment(token, currentPinned.id);
        }
      }

      await CommentService.pinComment(token, comment.id);
      await fetchComments();
    } catch (apiError: any) {
      console.log("Lỗi ghim:", apiError);
    }
  };

  const eventHostId = eventData?.host?.id || eventData?.host_id || "";
  const isUserHost =
    currentUserId !== null &&
    eventHostId !== "" &&
    currentUserId === eventHostId;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: "white" }} edges={["top"]} />
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="domain"
          size={40}
          color={Colors.color.white}
        />
        <CustomText style={styles.connect}>
          {" "}
          <CustomText variant="bold" style={{ color: "#FFFFFF" }}>
            EVENT{" "}
          </CustomText>
          CONNECT
        </CustomText>
        <View style={styles.Icon}>
          <NotificationBell />
          <TouchableOpacity onPress={handleShare}>
            <MaterialCommunityIcons
              name="share-variant"
              size={30}
              color={Colors.color.white}
              style={styles.accountIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                <Image
                  source={
                    eventData?.banner_url
                      ? { uri: eventData.banner_url }
                      : require("../assets/images/icon.png")
                  }
                  style={styles.banner}
                />

                <View style={styles.content}>
                  <CustomText
                    variant="bold"
                    style={[styles.mainTitle, { color: themeColor }]}
                  >
                    {eventData?.title}
                  </CustomText>

                  {/* Tag loại sự kiện */}
                  {eventData?.event_type && (
                    <View style={styles.tagsRow}>
                      <View style={styles.tagBadgeBlue}>
                        <CustomText variant="bold" style={styles.tagTextBlue}>
                          {eventData.event_type}
                        </CustomText>
                      </View>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="calendar-month"
                      size={28}
                      color={themeColor}
                    />
                    <View style={styles.infoTextGroup}>
                      <CustomText variant="bold" style={styles.infoLabel}>
                        Event Timeline (Time & Date)
                      </CustomText>
                      <CustomText style={styles.infoValue}>
                        Bắt đầu: {timePart}, {datePart}
                      </CustomText>
                      {endDatePart ? (
                        <CustomText style={[styles.infoValue, { marginTop: 2 }]}>
                          Kết thúc: {endTimePart}, {endDatePart}
                        </CustomText>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="location-sharp" size={28} color={themeColor} />
                    <View style={styles.infoTextGroup}>
                      <CustomText variant="bold" style={styles.infoLabel}>
                        Location
                      </CustomText>
                      <CustomText style={styles.infoValue}>
                        {eventData?.location_url || EVENT_LOCATION_DEFAULT}
                      </CustomText>
                    </View>
                  </View>

                  {/* THÔNG TIN BỔ SUNG */}
                  {eventData?.training_points ? (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="star-circle" size={28} color="#D97706" />
                      <View style={styles.infoTextGroup}>
                        <CustomText variant="bold" style={styles.infoLabel}>Điểm rèn luyện</CustomText>
                        <CustomText style={[styles.infoValue, { color: "#D97706", fontWeight: "600" }]}>+{eventData.training_points} ĐRL</CustomText>
                      </View>
                    </View>
                  ) : null}

                  {eventData?.target_audience ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="people" size={28} color={themeColor} />
                      <View style={styles.infoTextGroup}>
                        <CustomText variant="bold" style={styles.infoLabel}>Đối tượng tham gia</CustomText>
                        <CustomText style={styles.infoValue}>{eventData.target_audience}</CustomText>
                      </View>
                    </View>
                  ) : null}

                  {eventData?.benefits ? (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="gift" size={28} color={themeColor} />
                      <View style={styles.infoTextGroup}>
                        <CustomText variant="bold" style={styles.infoLabel}>Quyền lợi tham gia</CustomText>
                        <CustomText style={styles.infoValue}>{eventData.benefits}</CustomText>
                      </View>
                    </View>
                  ) : null}

                  {eventData?.description && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeaderRow}>
                        <Ionicons
                          name="information-circle"
                          size={24}
                          color={themeColor}
                        />
                        <CustomText variant="bold" style={styles.sectionTitle}>
                          About the Event
                        </CustomText>
                      </View>
                      <CustomText style={styles.bodyText}>
                        {eventData.description}
                      </CustomText>
                    </View>
                  )}

                  {(eventData?.host || eventData?.host_id) && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeaderRow}>
                        <Ionicons name="person" size={20} color={themeColor} />
                        <CustomText variant="bold" style={styles.sectionTitle}>
                          Host/Organization
                        </CustomText>
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
                              },
                            });
                          }
                        }}
                      >
                        {eventData?.host?.avatar_url ? (
                          <Image
                            source={{ uri: eventData.host.avatar_url }}
                            style={styles.hostAvatar}
                          />
                        ) : (
                          <View
                            style={[
                              styles.hostAvatar,
                              {
                                backgroundColor: "#e1e4e8",
                                justifyContent: "center",
                                alignItems: "center",
                              },
                            ]}
                          >
                            <Ionicons name="person" size={24} color="#a3a6ac" />
                          </View>
                        )}
                        <View>
                          <CustomText variant="bold" style={styles.hostName}>
                            {eventData?.host?.full_name
                              ? eventData.host.full_name
                              : "Event Organizer"}
                          </CustomText>
                          <CustomText style={styles.hostSubText}>Host</CustomText>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={[styles.section, { marginBottom: 20 }]}>
                    <View style={styles.sectionHeaderRow}>
                      <MaterialCommunityIcons
                        name="comment-text-multiple"
                        size={22}
                        color={themeColor}
                      />
                      <CustomText variant="bold" style={styles.sectionTitle}>
                        Comments ({comments.length})
                      </CustomText>
                    </View>

                    {loadingComments && (
                      <ActivityIndicator
                        size="small"
                        color={themeColor}
                        style={{ marginTop: 20 }}
                      />
                    )}

                    {!loadingComments && organizedComments.roots.length > 0 && (
                      <View style={[styles.commentList, { marginTop: 15 }]}>
                        {organizedComments.roots.slice(0, 3).map((comment) => (
                          <CommentItem
                            key={comment.id}
                            comment={comment}
                            allReplies={
                              organizedComments.flatRepliesMap.get(comment.id) || []
                            }
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
                      <TouchableOpacity
                        style={[styles.viewAllCommentsBtn, { marginBottom: 15 }]}
                        onPress={() => setShowAllCommentsModal(true)}
                      >
                        <CustomText variant="bold" style={styles.viewAllCommentsText}>
                          View all {comments.length} comments
                        </CustomText>
                      </TouchableOpacity>
                    )}

                    <View style={{ marginTop: 5, marginBottom: 10 }}>
                      {replyingTo && (
                        <View style={styles.replyingToHeader}>
                          <CustomText style={styles.replyingToText}>
                            Replying to{" "}
                            <CustomText variant="bold">{replyingTo.name}</CustomText>
                          </CustomText>
                          <TouchableOpacity onPress={() => setReplyingTo(null)}>
                            <Ionicons name="close-circle" size={16} color="#888" />
                          </TouchableOpacity>
                        </View>
                      )}
                      <View style={styles.commentInputRow}>
                        <TextInput
                          ref={commentInputRef}
                          style={styles.commentInput}
                          placeholder="Add a public comment..."
                          placeholderTextColor={Colors.color.placeholder}
                          value={newComment}
                          onChangeText={setNewComment}
                          multiline
                        />
                        <TouchableOpacity
                          style={[
                            styles.postCommentBtn,
                            {
                              backgroundColor: newComment.trim() ? themeColor : "#ccc",
                            },
                          ]}
                          disabled={!newComment.trim()}
                          onPress={handleSendComment}
                        >
                          <Ionicons name="send" size={18} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>

          <Modal
            visible={showAllCommentsModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => {
              setShowAllCommentsModal(false);
              setReplyingTo(null);
            }}
          >
            <SafeAreaView style={styles.modalContainer}>
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.modalHeader}>
                    <View style={{ width: 30 }} />
                    <CustomText variant="bold" style={styles.modalTitle}>
                      Comments ({comments.length})
                    </CustomText>
                    <TouchableOpacity
                      style={styles.modalCloseBtn}
                      onPress={() => {
                        setShowAllCommentsModal(false);
                        setReplyingTo(null);
                      }}
                    >
                      <Ionicons name="close" size={26} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                      <View style={{ flex: 1 }}>
                        {organizedComments.roots.map((comment) => (
                          <CommentItem
                            key={comment.id}
                            comment={comment}
                            allReplies={
                              organizedComments.flatRepliesMap.get(comment.id) || []
                            }
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
                        <View style={{ height: 40 }} />
                      </View>
                    </TouchableWithoutFeedback>
                  </ScrollView>

                  <View
                    style={[
                      styles.modalFooter,
                      {
                        position: "relative",
                        borderTopWidth: 1,
                        borderColor: "#eee",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                      },
                    ]}
                  >
                    {replyingTo && (
                      <View
                        style={[
                          styles.replyingToHeader,
                          { marginLeft: 0, marginBottom: 5 },
                        ]}
                      >
                        <CustomText style={styles.replyingToText}>
                          Replying to{" "}
                          <CustomText variant="bold">{replyingTo.name}</CustomText>
                        </CustomText>
                        <TouchableOpacity onPress={() => setReplyingTo(null)}>
                          <Ionicons name="close-circle" size={16} color="#888" />
                        </TouchableOpacity>
                      </View>
                    )}
                    <View style={styles.commentInputRow}>
                      <TextInput
                        ref={modalInputRef}
                        style={styles.commentInput}
                        placeholder="Add a public comment..."
                        placeholderTextColor={Colors.color.placeholder}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                      />
                      <TouchableOpacity
                        style={[
                          styles.postCommentBtn,
                          { backgroundColor: newComment.trim() ? themeColor : "#ccc" },
                        ]}
                        disabled={!newComment.trim()}
                        onPress={handleSendComment}
                      >
                        <Ionicons name="send" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </Modal>

          <View style={styles.footer}>
            <View style={styles.capacityInfo}>
              <CustomText style={styles.capacityLabel}>Số lượng tham gia</CustomText>
              <CustomText variant="bold" style={styles.capacityValue}>
                {eventData?._count?.applications || 0} <CustomText style={styles.capacityMax}>/ {eventData?.max_attendees || "∞"}</CustomText>
              </CustomText>
            </View>
            <TouchableOpacity
              style={[
                styles.regBtn,
                { backgroundColor: registered ? "#ccc" : themeColor }
              ]}
              disabled={registered}
              onPress={handleRegister}
            >
              <CustomText variant="bold" style={styles.regBtnText}>
                {registered ? "REGISTERED" : "REGISTER NOW"}
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    height: 60,
    alignItems: "center",
    backgroundColor: Colors.color.primary,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
  },
  connect: {
    fontSize: 18,
    color: Colors.color.white,
  },
  accountIcon: {
    borderRadius: 20,
  },
  Icon: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginLeft: "auto",
  },
  scrollBody: { paddingBottom: 110 },
  banner: { width: "100%", height: 200, resizeMode: "cover" },
  content: { padding: 20 },
  mainTitle: { fontSize: 22, marginBottom: 10 },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tagBadgeBlue: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagTextBlue: {
    color: '#0047AB',
    fontSize: 11,
  },
  tagBadgeGreen: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagTextGreen: {
    color: '#046C4E',
    fontSize: 11,
  },
  infoRow: { flexDirection: "row", marginBottom: 15, alignItems: "center" },
  infoTextGroup: { marginLeft: 12, flex: 1 },
  infoLabel: { fontSize: 15, color: "#333" },
  infoValue: { color: "#666", marginTop: 3, fontSize: 13 },
  section: { marginTop: 25 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 17, marginLeft: 8, color: "#333" },
  bodyText: { color: "#666", lineHeight: 20, fontSize: 13 },
  hostName: { color: "#333", fontSize: 14, marginBottom: 5 },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capacityInfo: {
    flex: 1,
    marginRight: 10,
  },
  capacityLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  capacityValue: {
    fontSize: 18,
    color: Colors.light.tint,
  },
  capacityMax: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'normal',
  },
  regBtn: { flex: 1.2, padding: 16, borderRadius: 30, alignItems: "center" },
  regBtnText: { color: "white", fontSize: 16 },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  hostAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  hostSubText: { color: "#888", fontSize: 12, marginTop: 2 },
  replyingToHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e4e6eb",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginLeft: 0,
    marginBottom: 0,
  },
  replyingToText: { fontSize: 12, color: "#555", marginRight: 10 },
  commentInputRow: { flexDirection: "row", alignItems: "flex-start" },
  commentInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 13,
    maxHeight: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  postCommentBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  commentList: { marginTop: 5 },
  commentContainer: { marginBottom: 20 },
  commentMain: { flexDirection: "row", alignItems: "flex-start" },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  commentBody: { flex: 1 },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  commentUserName: { fontSize: 13, marginRight: 8, color: "#333" },
  commentTime: { fontSize: 11, color: "#aaa", marginLeft: "auto" },
  commentContent: { fontSize: 13, color: "#444", lineHeight: 18 },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 2 },
  actionBtnText: { fontSize: 12, fontWeight: "500" },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
  },
  pinnedText: { fontSize: 9, marginLeft: 3 },
  repliesList: { marginLeft: 48, marginTop: 12 },
  writeCommentBtn: {
    alignSelf: "stretch",
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  writeCommentBtnText: { fontSize: 13, color: "#6B7280" },
  viewAllCommentsBtn: {
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
  },
  viewAllCommentsText: { fontSize: 13, color: "#555" },
  viewMoreRepliesBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 48,
    marginTop: 8,
  },
  viewMoreDash: {
    width: 24,
    height: 1,
    backgroundColor: "#aaa",
    marginRight: 8,
  },
  viewMoreRepliesText: { fontSize: 13, color: "#666" },
  modalContainer: { flex: 1, backgroundColor: "white" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 16, color: "#111" },
  modalCloseBtn: { padding: 4 },
  modalFooter: {
    backgroundColor: "white",
  },
});