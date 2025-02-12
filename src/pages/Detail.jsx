import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Btn from "../components/Btn";
import Navbar from "../components/Navbar";
import NavWrapper from "../components/NavWrapper";
import CommentList from "../components/comment/CommentList";
import CommentInput from "../components/comment/CommentInput";
import ReportModal from "../components/modal/ReportModal";
import { FiChevronLeft, FiArrowUp } from "react-icons/fi";
import { MdOutlineReport } from "react-icons/md";
import KakaoMapScript from "../util/KakaoMapScript";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  deleteStore,
  showDetailStore,
  postComment,
  showComment,
  postReport,
  editingComment,
  likes,
  showlikes,
  commentReport,
} from "../api/api";
import Cookies from "js-cookie";

function Detail() {
  const navigate = useNavigate();
  const token = Cookies.get("access_token");
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [storeReportModal, setStoreReportModal] = useState(false);
  const [commentReportModal, setCommentReportModal] = useState(false);
  const [comment, setComment] = useState("");
  const [editComment, setEditComment] = useState("");
  const [storeReportReason, setStoreReportReason] = useState("");
  const [commentReportReason, setCommentReportReason] = useState("");
  const [edit, setEdit] = useState(true);
  const [ids, setIds] = useState("");
  const userInfo = localStorage.getItem("userInfo");
  const userObjectInfo = JSON.parse(userInfo);
  const userId = userObjectInfo.id;

  const { data } = useQuery(["showDetail", id], () =>
    showDetailStore({ id, token })
  );

  const { data: commentList } = useQuery("showPostComment", () =>
    showComment(id)
  );
  useEffect(() => {
    KakaoMapScript(data?.longitude, data?.latitude);
  }, [data?.latitude, data?.longitude]);

  const dlelteStoreItem = useMutation(deleteStore, {
    onSuccess: () => {
      queryClient.invalidateQueries("showPostComment");
      navigate("/");
    },
  });

  const postingComment = useMutation(postComment, {
    onSuccess: () => {
      queryClient.invalidateQueries("showPostComment");
    },
  });

  const postingReport = useMutation(postReport, {
    onSuccess: () => {},
  });

  const editsComment = useMutation(editingComment, {
    onSuccess: () => {
      queryClient.invalidateQueries("showPostComment");
    },
  });

  const commentReportQuery = useMutation(commentReport, {
    onSuccess: () => {},
  });

  const commentHandler = (e) => {
    e.preventDefault();
    const commentInfo = { comment: comment, storeId: Number(id) };
    postingComment.mutate({ token, commentInfo });
    setComment("");
  };

  const { data: showLike } = useQuery("showLike", () =>
    showlikes({ token: token, storeId: id, userId: userId })
  );

  const likeButton = useMutation(likes, {
    onSuccess: () => {
      queryClient.invalidateQueries("showLike");
    },
  });

  function commentSet(e) {
    setComment(e.target.value);
  }

  function onDelete() {
    dlelteStoreItem.mutate({ token: token, id: id });
  }

  const clickReport = () => {
    setStoreReportModal(!storeReportModal);
  };

  function onChangeReport(e) {
    setStoreReportReason(e.target.value);
  }

  const onChangeCommentReportReason = (e) => {
    setCommentReportReason(e.target.value);
  };

  function submitReport(e) {
    e.preventDefault();
    postingReport.mutate({
      token: token,
      storeId: id,
      reason: storeReportReason,
    });
    setStoreReportModal(false);
  }

  const submitCommentReportReason = (e) => {
    e.preventDefault();
    commentReportQuery.mutate({
      token: token,
      commentId: ids,
      reason: commentReportReason,
    });
  };

  function editHandler(id) {
    setEdit(!edit);
    setIds(id);
  }

  function clickReportModalHandler(id) {
    setCommentReportModal(!commentReportModal);
    setIds(id);
  }

  function changeEdit(e) {
    setEditComment(e.target.value);
  }

  function editForm(e) {
    e.preventDefault();
    const editBody = {
      comment: editComment,
      storeId: id,
    };
    editsComment.mutate({ token: token, commentId: ids, body: editBody });
    setEditComment("");
  }

  function clickLike() {
    likeButton.mutate({ token: token, storeId: id });
  }

  class reportProps {
    constructor(inputValue, onChangeHandler, submitHandler, openHandler) {
      this.inputValue = inputValue;
      this.onChangeHandler = onChangeHandler;
      this.submitHandler = submitHandler;
      this.openHandler = openHandler;
    }
  }

  const storeReportProps = new reportProps(
    storeReportReason,
    onChangeReport,
    submitReport,
    clickReport
  );

  const commentReportProps = new reportProps(
    commentReportReason,
    onChangeCommentReportReason,
    submitCommentReportReason,
    clickReportModalHandler
  );

  return (
    <DetailBox>
      <NavWrapper>
        <Navbar>
          <Link to={-1}>
            <FiChevronLeft size={40}></FiChevronLeft>
          </Link>
        </Navbar>
        <BtnWrapper>
          <Navbar>
            <FaHeart
              style={{
                color: showLike?.data?.data.isMyLike ? "#F96666" : "black",
              }}
              onClick={clickLike}
              size={30}
            ></FaHeart>
            <LikeCountSpan>{showLike?.data?.data.likeCount}</LikeCountSpan>
          </Navbar>
          <Navbar>
            <ReportIcon onClick={clickReport} size={37}></ReportIcon>
          </Navbar>
        </BtnWrapper>
      </NavWrapper>
      <DetailContentBox>
        <KakaoMap id="mymap"></KakaoMap>
        <ContentName>
          <ContentNameText>
            <ContentNameTextTitle>{data?.content}</ContentNameTextTitle>
            {data?.itemList[0]?.name} {data?.itemList[0]?.price ? ":" : ""}{" "}
            {data?.itemList[0]?.price}
            {data?.itemList[0]?.name ? "원" : ""}
            <br />
            <div>
              {data?.itemList[1]?.name} {data?.itemList[1]?.name ? ":" : ""}{" "}
              {data?.itemList[1]?.price} {data?.itemList[1]?.name ? "원" : ""}
            </div>
          </ContentNameText>
        </ContentName>
        <ImageAndContentsBox>
          <ImageSize src={data?.imageURL} />
        </ImageAndContentsBox>
        <CommentListWrapper>
          {commentList?.map((item) => {
            return (
              <CommentList
                key={item.id}
                edithand={editHandler}
                item={item}
                clickReportModalHandler={clickReportModalHandler}
              ></CommentList>
            );
          })}
        </CommentListWrapper>
        {edit ? (
          <CommentForm onSubmit={commentHandler}>
            <CommentInput
              value={comment}
              onChange={commentSet}
              placeholder="리뷰를 입력해주세요."
            />
            <Btn commentBtn>
              <FiArrowUp size={33} />
            </Btn>
          </CommentForm>
        ) : (
          <CommentForm onSubmit={editForm}>
            <CommentInput
              value={editComment}
              onChange={changeEdit}
              placeholder="수정할 내용을 입력해주세요."
            />
            <SubmitButton commentBtn>
              <FiArrowUp size={33} />
            </SubmitButton>
          </CommentForm>
        )}

        <DeleteContain>
          <Btn
            deleteItem={onDelete}
            mainDelete
            children={"이 붕어빵은 작성자만 삭제가능해요."}
          ></Btn>
        </DeleteContain>
        {storeReportModal && (
          <ReportModal props={storeReportProps}>
            게시물 신고 사유를 입력해주세붕어
          </ReportModal>
        )}
        {commentReportModal && (
          <ReportModal props={commentReportProps}>
            댓글 신고 사유를 입력해주세붕어.
          </ReportModal>
        )}
      </DetailContentBox>
    </DetailBox>
  );
}

const KakaoMap = styled.div`
  margin-top: 50px;
  height: 300px;
  width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1.25rem;
`;

const DetailBox = styled.div`
  //border: 1px solid red;
  overflow: auto;
  height: 100%;
`;

const ReportIcon = styled(MdOutlineReport)`
  cursor: pointer;
`;

const DetailContentBox = styled.div`
  //border: 1px solid blue;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 5rem;
  margin-bottom: 3.125rem;
`;

const BtnWrapper = styled.div`
  display: flex;
`;

const ContentName = styled.div`
  border: 3px solid white;
  border-radius: 30px;
  width: 300px;
  height: 80px;
  margin-top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "KCC-Ganpan";
`;

const ContentNameText = styled.div`
  //border: 1px solid blue;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  height: 80%;
`;

const ContentNameTextTitle = styled.div`
  margin-bottom: 5px;
`;

const ImageAndContentsBox = styled.div`
  //border: 2px solid black;
  height: 18.75rem;
  width: 21.875rem;
  margin-top: 3.125rem;
  margin-bottom: 2.5rem;
`;

const ImageSize = styled.img`
  height: 18.75rem;
  width: 21.875rem;
  border-radius: 20px;
`;

const DeleteContain = styled.div`
  //border: 0.0625rem solid black;
  margin-top: 1.875rem;
`;

const CommentListWrapper = styled.div`
  width: 450px;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.color.item_bg};
`;

const CommentForm = styled.form`
  //border: 0.0625rem solid black;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 450px;
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 10px;
    border-radius: 15px;
  }
`;

const SubmitButton = styled(Btn)`
  background-color: ${({ theme }) => theme.color.btn_danger};
`;

const LikeCountSpan = styled.span`
  font-size: 30px;
  position: absolute;
  margin-left: 10px;
`;

export default Detail;
