<script setup lang="ts"></script>

<template>
  <div class="Intro-wrap px-20rem">
    <div class="title">{{ `Description` }}</div>
    <div class="content-wrap">
      <p class="">
        {{
          `PunkPanda is a Consensus Feeding Game where all PunkPanda NFT holders can collectively feed a PunkPanda.`
        }}
      </p>
      <ul>
        <li>
          {{
            `If the cumulative feeding from all holders reaches 1000 VIC daily, the PunkPanda will survive; otherwise, it will perish immediately.`
          }}
        </li>
        <li class="">
          {{
            `In the event of the PunkPanda's survival, all feeding balances will be stored in the smart contract, owned by the DAO community.`
          }}
        </li>
        <li class="">
          {{
            `Upon the Panda's demise, 50% of the feeding balance will be returned to users based on their contributions, while the remaining 50% will go to the project team.`
          }}
        </li>
        <li class="">
          {{
            `If the PunkPanda survives, PD (panda) tokens will be airdropped daily to all holders based on their contributions.`
          }}
        </li>
        <li class="">
          {{
            `Users can participate in the game by obtaining the PunkPanda NFT. Refer to the mint page for detailed minting rules.`
          }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.Intro-wrap {
  width: 100%;
  margin-top: 61rem;
  margin-bottom: 214rem;
  max-width: 1572rem;

  @media (max-width: $phone) {
    max-width: 100%;
  }

  .title {
    color: #fff;
    font-family: Inter;
    font-size: 39rem;
    font-style: normal;
    font-weight: 700;
    line-height: 127.5%; /* 49.725px */
    text-transform: capitalize;
  }

  .content-wrap {
    width: 100%;
    margin-top: 18rem;
    padding: 30rem 45rem;
    border-radius: 6px;
    border: 1px solid #000;
    background: #1d1e22;
    @include flexPos(flex-start, flex-start);
    flex-direction: column;
    color: #fff;
    font-family: Inter;
    font-size: 20rem;
    font-weight: 500;
    line-height: 200%; /* 200% */

    ul {
      list-style-type: disc;
      list-style-position: inside;
      padding-left: 0;
      margin-left: 20rem;

      li {
        list-style-type: disc;
      }
    }
  }
}
</style>
