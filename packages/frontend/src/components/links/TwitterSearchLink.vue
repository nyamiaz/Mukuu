<template>
  <div class="twitter-search-word">
    <slot name="caption"></slot>
    <div class="link">
      <a :href="this.twitterSearchLink" target="_blank">
        <i class="el-icon-link"></i>
        <span>Twitterで検索する</span>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.twitter-search-word {
  display: flex;
  justify-content: center;
  &.wrap {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    p {
      color: black;
    }
  }
  .link {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
  }
  &.tail {
    & .link {
      width: 100%;
      a {
        width: 100%;
        text-align: center;
      }
    }
  }
  i + span {
    margin-left: 0.5rem;
  }
}
</style>

<script>
import {
  acceptedDomains,
  acceptedHashtags,
  acceptedWords
} from "@mukuu/common/lib/constants";

export default {
  name: "TwitterSearchLink",
  props: ["searchWord"],
  computed: {
    twitterSearchText: {
      get() {
        const domains = acceptedDomains.join(" OR ");
        const HASH_TAGS = acceptedHashtags.join(" OR ");
        const WORDS = acceptedWords.join(" OR ");
        return encodeURIComponent(
          `${this.searchWord} ${domains} ${HASH_TAGS} OR ${WORDS}`
        );
      }
    },
    twitterSearchLink: {
      get() {
        return `https://twitter.com/search?q=${this.twitterSearchText}&f=live`;
      }
    }
  }
};
</script>
