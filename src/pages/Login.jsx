import React, { useEffect } from "react";
import Btn from "../components/Btn";
import styled from "styled-components";
import SignInput from "../components/SignInput";
import { Link, useNavigate } from "react-router-dom";
import useLoginInput from "../hooks/useLoginInput";
import { useMutation } from "react-query";
import { postLogin } from "../api/api";
import isLogin from "../util/token";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const login = useMutation(postLogin, {
    onSuccess: () => {
      navigate("/");
    },
  });

  useEffect(() => {
    if (isLogin() === true) {
      navigate("/");
    }
  }, [navigate]);

  const idReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [inputId, inputIdHandler, alertId, checkIdReg] = useLoginInput(
    "",
    "ID를 입력해줭",
    "이메일 형식으로 작성해줭",
    "팥이 좋아 슈크림이 좋아?",
    idReg
  );

  const pwReg = /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;
  const [inputPassword, inputPasswordHandler, alertPw, checkPwReg] =
    useLoginInput(
      "",
      "Password를 입력해줭",
      "영어 소문자와 숫자, 특수문자 조합의 8-20자로 입력해줭",
      "나는 타코야키! Mommy don't know~ daddy's getting hot 🔥",
      pwReg
    );

  function onSubmitlogin(e) {
    e.preventDefault();
    if (inputId === "" && inputPassword === "") {
      return;
    }
    const loginInfo = {
      email: inputId,
      password: inputPassword,
    };
    login.mutate(loginInfo);
  }

  const kakaoLogin = async () => {
    try {
      const response = await axios.get(
        "https://port-0-kikidy12-bbangeobung-backend-108dypx2aldzyvyjq.sel3.cloudtype.app/oauth2/authorization/kakao",
        {},
        {
          headers: {
            withCredentials: false,
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      console.log(response);
    } catch (e) {
      console.log("postStore", e);
    }
  };

  return (
    <>
      <LogInContainer>
        <Title>빵 어 붕</Title>
        <Form onSubmit={onSubmitlogin} id="userInfoSubmit">
          <SignInput value={inputId} onChange={inputIdHandler} />
          <CheckReg checkReg={checkIdReg}>{alertId}</CheckReg>
          <SignInput
            value={inputPassword}
            onChange={inputPasswordHandler}
            type="password"
          />
          <CheckReg checkReg={checkPwReg}>{alertPw}</CheckReg>
        </Form>
        <BtnWrapper>
          <Btn signUp onClick={() => navigate("/signup")}>
            이메일로 회원가입
          </Btn>
          <Btn onClick={kakaoLogin} kakao>
            카카오 회원 가입
          </Btn>
          <Btn type="submit" form="userInfoSubmit">
            로그인 하기
          </Btn>
        </BtnWrapper>
      </LogInContainer>
    </>
  );
}

const LogInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 19vh;
`;

const Title = styled.h2`
  font-size: 2.5em;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 390px;
`;

const CheckReg = styled.span`
  height: 30px;
  margin: 4px 0 0 8px;
  color: ${(props) =>
    props.checkReg ? "#609966" : props.theme.color.btn_danger};
`;

const BtnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
  button {
    margin-top: 16px;
  }
`;

export default Login;
